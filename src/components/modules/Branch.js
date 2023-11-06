import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import onlyUniq from '../../functions/onlyUniq'
import {addAttrsFromShortcode} from '../../functions/functions'




export default function Branch(props) {
    const branch = props.branch
    let steps = useSelector(state => state.steps);
    const filter = useSelector(state => state.filter);
    const employees = useSelector(state => state.employees);
    const step = useSelector(state => state.step)
    const activeStep = step.active;
    const dispatch = useDispatch();
    let asyncEmps = []
    const next = async (id, skipPers = false) => {
      dispatch({type: 'LOADING'})
      dispatch({
        type: 'SET_BRANCH',
        payload: id
      })
  
      if (!employees.filter(el => el.cats == id).length) {
          let params = new URLSearchParams();
          params.set('action', 'oz_get_employees')
          params.set('cat', id)
          addAttrsFromShortcode(params)
          const result = await (await fetch(
            oz_vars.oz_ajax_url, {
              method: 'post',
              body: params
            }
          )).json();
          if (result.success) {
            if (result.payload.type == 'employees') {
              asyncEmps = result.payload.result.list
          dispatch({
            type: 'SET_EMPLOYEES',
            payload: result.payload.result.list
          })
          }
        }
      }

      let ind = asyncEmps.length ? asyncEmps : employees
          ind = ind.filter(emp => emp.cats.indexOf(id) > -1)
      let main_filter = []
      if (filter.employee && Object.keys(filter.employee).length) {
        main_filter = onlyUniq(filter.employee, 'branches')
      }
    
      if (main_filter.length) {
        ind = ind.filter(emp => emp.cats.indexOf(id) > -1 && main_filter.indexOf(emp.id) > -1)
      }
      
      let service_filter = []
      if (filter.service && Object.keys(filter.service).length) {
        service_filter = onlyUniq(filter.service)
      }

      if (service_filter.length) {
        ind = ind.filter(emp => {
          let exc = true
          let inc = true
              exc = service_filter.filter(serv => emp.services.indexOf(serv) < 0).length == service_filter.length
              inc = service_filter.filter(serv => emp.services.indexOf(serv) > -1).length == service_filter.length
          let excl = emp.services_type == 'exclude' && exc
          let incl = emp.services_type == 'include' && inc
          return !emp.services.length || excl || incl
          })
      }

      if (skipPers && ind.length) {
        steps = steps.filter(step => step != 'employees')
        dispatch({
          type: 'SET_STEPS',
          payload: steps
        })        
      }
      else {
        if (steps.indexOf('employees') < 0) {
          steps = steps.reduce((arr,ser) => {
            arr.push(ser); 
            if (ser == 'branches') {
              arr.push('employees');
            }
            return arr;},[])
            dispatch({
              type: 'SET_STEPS',
              payload: steps
            })  
        }
      }

      dispatch({
        type: 'SET_FILTER',
        payload: {
            type: 'employee', 
            step: 'branches',
            value: ind.map(emp => Number(emp.id))
        }
        }) 
        let nextStep = steps.indexOf(activeStep)
            if (typeof steps[nextStep+1] != 'undefined') {
                dispatch({
                    type: 'SET_ACTIVE_STEP',
                    payload: steps[nextStep+1]
                })
            }
        }

    let btnText = oz_lang.r2
    if (branch.count == 1 && oz_vars.skipOneStep) {
        btnText = oz_lang.r3
    }
    return (
		<li className="filial">
        <h5>{branch.name}</h5>
        {/* //'oz_filial_address'
        <address></address> */}
        {branch.description && <div className="oz_term_desc" dangerouslySetInnerHTML={ {__html: branch.description} } />}
        <div className="oz_vibor">
                <div onClick={() => {next(branch.id)}} className="oz_btn oz_spec_btn">{btnText}</div>
                {(branch.count > 1 && oz_vars.skipemployee) && <div onClick={() => {next(branch.id, true)}} className="oz_btn oz_usl_btn">{oz_lang.r4}</div>}
        </div>
    </li>       
    )
}