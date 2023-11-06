import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Employee from '../modules/Employee'

import onlyUniq from '../../functions/onlyUniq'
import {addAttrsFromShortcode} from '../../functions/functions'

import store from '../../store'


export default function Employees() {
  const asyncElements = useSelector(state => state.asyncElements);
  const employees = useSelector(state => state.employees);
  const services = useSelector(state => state.services);
  const loading = useSelector(state => state.loading);
  const filter = useSelector(state => state.filter);
  let steps = useSelector(state => state.steps)
  const branches = useSelector(state => state.branches)
  const branch = useSelector(state => state.branch)
  const step = useSelector(state => state.step)
  const activeStep = step.active;
  const active = step.current == 'employees' ? ' active' : '';
  const dispatch = useDispatch();
  //const [CardHeights, collectCardHeights] = useState([])

  let main_filter = []
  if (filter.employee && Object.keys(filter.employee).length) {
    main_filter = onlyUniq(filter.employee, 'employees')
  }

  let service_filter = []
  if (filter.service && Object.keys(filter.service).length) {
    service_filter = onlyUniq(filter.service)
  }

  
  const filterEmployees = (empl) => {
    let mf = onlyUniq(filter.employee, 'employees')
    if (branch) {
      empl = empl.filter(emp => emp.cats.indexOf(branch) > -1)
    }
  

    if (mf.length) {
      empl = empl.filter(emp => mf.indexOf(emp.id) > -1)
    }

    // если в шорткоде есть атрибут услуг
    if (oz_vars.atts && oz_vars.atts?.services) {
        let atts_serv = oz_vars.atts?.services.replace('id=', '')
          if (atts_serv) {
            atts_serv = atts_serv.split(',')
            atts_serv = atts_serv.map(at => Number(at))
            empl = empl.filter(emp => {
              if (emp.services_type == 'exclude' || emp.services_type == 'include') {
                  let serv = emp.services.filter(ser => atts_serv.indexOf(ser) > -1)
                  return serv.length > 0 && emp.services_type == 'exclude' ||
                  !serv.length  && emp.services_type == 'include' ? false : true;
              }
              return emp
            })
          }
    }
  

    if (service_filter.length) {
      // возможно не нужен здесь этот код
      let owners = services.filter(ser => service_filter.indexOf(ser.id) > -1 && ser.owner).map(ser => ser.owner)
      if (owners.length) {
        owners = [].concat.apply([], owners)
      }
      // возможно не нужен здесь этот код конец
      empl = empl.filter(emp => {
        let owner = owners.length ? owners.indexOf(emp.id) > -1 : true;
        let exc = true
        let inc = true
            exc = service_filter.filter(serv => emp.services.indexOf(serv) < 0).length == service_filter.length
            inc = service_filter.filter(serv => emp.services.indexOf(serv) > -1).length == service_filter.length
        let excl = emp.services_type == 'exclude' && exc
        let incl = emp.services_type == 'include' && inc
        return (!emp.services.length || excl || incl) && owner
        })
    }
    return empl
  }

  let emps = filterEmployees(employees)

  const next = () => {
    dispatch({
      type: 'SET_FILTER',
      payload: {
          type: 'employee', 
          step: 'employees',
          value: emps.map(emp => Number(emp.id))
        }                
    })
    
    dispatch({
      type: 'SET_EMPLOYEE_ON_SKIP',
      payload: emps.map(emp => Number(emp.id))
    })
    
    let nextStep = steps.indexOf(activeStep)
    if (typeof steps[nextStep+1] != 'undefined') {
        dispatch({type: 'LOADING'})
        dispatch({
            type: 'SET_ACTIVE_STEP',
            payload: steps[nextStep+1]
        })
    } 
  }


  useEffect(async () => {
    if (oz_vars.employee_page && asyncElements.indexOf('employees') < 0 && steps.indexOf('employees') != 0) {
      let params = new URLSearchParams();
    dispatch({type:'LOADING'})
    params.set('action', 'oz_get_employees')
    addAttrsFromShortcode(params)
    const result = await (await fetch(
      oz_vars.oz_ajax_url, {
        method: 'post',
        body: params
      }
    )).json();
    if (result.success) {
      if (result.payload.type == 'employees') {
        dispatch({
          type: 'SET_LOADED',
          payload: 'employees',
        })
          dispatch({
            type: 'SET_EMPLOYEES',
            payload: result.payload.result.list
          })

          // если один сотрудник и включен пропуск
          if (result.payload.result.list.length == 1 && (oz_vars.skipOneStep || oz_vars.employee_page)) {
            let nextStep = steps.indexOf('employees')
            let employee_restore = steps.indexOf(step.current)
            nextStep = steps[nextStep + 1]    
            steps = steps.filter(step => step != 'employees')
            let value = result.payload.result.list.map(e => Number(e.id))
            dispatch({
              type: 'SET_FILTER',
              payload: {
                  type: 'employee', 
                  step: 'employees',
                  value
                }                
            })
          }
      }
      else if (result.payload.type == 'branches') {
        if (asyncElements.indexOf('branches') < 0)
        dispatch({
          type: 'SET_LOADED',
          payload: 'branches',
        })
        steps =  store.getState().steps // fix т.к. не берет актуальный стейт через useselector при выборе услуги если не мультивыбор (почему то изменение шага не видит)
        let newsteps = steps.reduce((arr,el, ind) => {
          if (el == 'employees' && arr.indexOf('branches') < 0)
          arr.push('branches')
          arr.push(el) 
          return arr;
          },[])
          dispatch({
            type: 'SET_STEPS',
            payload: newsteps
          })
          dispatch({
            type: 'SET_BRANCHES',
            payload: result.payload.result.list
          })
          dispatch({
            type: 'SET_ACTIVE_STEP',
            payload: 'branches'
          })
      }
    }
    }
    else {

    }
  }, [])

  useEffect(async () => {
    if (step.active != step.current && step.active == 'employees') {
      if (asyncElements.indexOf('branches') < 0 && asyncElements.indexOf('employees') < 0) {
        let params = new URLSearchParams();
    dispatch({type:'LOADING'})
    params.set('action', 'oz_get_employees')
    addAttrsFromShortcode(params)
    const result = await (await fetch(
      oz_vars.oz_ajax_url, {
        method: 'post',
        body: params
      }
    )).json();
    if (result.success) {
      if (result.payload.type == 'employees') {
        if (asyncElements.indexOf('employeess') < 0)
        dispatch({
          type: 'SET_LOADED',
          payload: 'employees',
        })
          dispatch({
            type: 'SET_EMPLOYEES',
            payload: result.payload.result.list
          })

          // если один сотрудник и включен пропуск
          if ((result.payload.result.list.length == 1 || (!emps.length && filterEmployees(result.payload.result.list).length == 1)) && (oz_vars.skipOneStep || oz_vars.employee_page)) {
            let nextStep = steps.indexOf('employees')
            let employee_restore = steps.indexOf(step.current)
            nextStep = steps[nextStep + 1]    
            steps = steps.filter(step => step != 'employees')
            let value = result.payload.result.list.map(e => Number(e.id))
            // если подходит только один сотрудник при первой загрузке чтобы он выбирался
              if (result.payload.result.list.length > 1 && !emps.length) {
                value = filterEmployees(result.payload.result.list).map(e => Number(e.id))
              }
            dispatch({
              type: 'SKIP_IF_ONE_EMPLOYEE',
              payload: {
                'steps' : steps,
                'next' : nextStep,
                'id' : value,
                employee_restore
              }
            })
            setTimeout( () => {
            dispatch({
              type: 'SET_FILTER',
              payload: {
                  type: 'employee', 
                  step: 'employees',
                  value
                }                
            })
          }, oz_vars.animation)
          }
          else {
            dispatch({
              type: 'SET_CURRENT_STEP',
              payload: 'employees'
            })            
          }
      }
      else if (result.payload.type == 'branches') {
        if (asyncElements.indexOf('branches') < 0)
        dispatch({
          type: 'SET_LOADED',
          payload: 'branches',
        })
        steps =  store.getState().steps // fix т.к. не берет актуальный стейт через useselector при выборе услуги если не мультивыбор (почему то изменение шага не видит)
        let newsteps = steps.reduce((arr,el, ind) => {
          if (el == 'employees' && arr.indexOf('branches') < 0)
          arr.push('branches')
          arr.push(el) 
          return arr;
          },[])
          dispatch({
            type: 'SET_STEPS',
            payload: newsteps
          })
          dispatch({
            type: 'SET_BRANCHES',
            payload: result.payload.result.list
          })
          dispatch({
            type: 'SET_ACTIVE_STEP',
            payload: 'branches'
          })
      }
    }
    dispatch({type: 'LOADED'})
  }
  else {
    if (emps.length == 1 && (oz_vars.skipOneStep || oz_vars.employee_page)) {
      let employee_restore = steps.indexOf(step.current)
      let nextStep = steps.indexOf('employees')
          nextStep = steps[nextStep + 1]    
          steps = steps.filter(step => step != 'employees')
      dispatch({
        type: 'SKIP_IF_ONE_EMPLOYEE',
        payload: {
          'steps' : steps,
          'next' : nextStep,
          'id' : emps.map(e => Number(e.id)),
          employee_restore
        }
      })
      setTimeout(() => {
        dispatch({
          type: 'SET_FILTER',
          payload: {
              type: 'employee', 
              step: 'employees',
              value: emps.map(e => Number(e.id))
            }                
        })
      }, oz_vars.animation)
    }
    else {
      dispatch({
        type: 'SET_CURRENT_STEP',
        payload: 'employees'
      })
      dispatch({type: 'LOADED'})
      }
    }
  }
  }, [activeStep])

return (<div className={`oz_employees${active}`}>
       {(oz_vars.skipemployee && emps.length && !branches.length ) ? <div onClick={() => {next()}} className="oz_btn">{oz_lang.r27}</div> : null } 
      {emps.length > 0 
      ? 
      <ul className="personals">{emps.map(employee => <Employee employee={employee} />)}</ul>
      : 
      <>{(!loading && asyncElements.length) ? oz_lang.r14 : ''}</>
      }
      </div>)
  }