import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Branch from '../modules/Branch'

import onlyUniq from '../../functions/onlyUniq'


export default function Branches() {
  let branches = useSelector(state => state.branches);
  const asyncElements = useSelector(state => state.asyncElements);
  const steps = useSelector(state => state.steps)
  const step = useSelector(state => state.step)
  const filter = useSelector(state => state.filter);
  let employees = useSelector(state => state.employees);
  const active = step.current == 'branches'  ? ' active' : '';
  const dispatch = useDispatch();

  useEffect(() => {
    if (step.active != step.current && step.active == 'branches') {
      dispatch({type:'LOADED'})
      dispatch({
      type: 'SET_CURRENT_STEP',
      payload: 'branches'
    }) 
    }
    else {
      if (steps.indexOf(step.active) < steps.indexOf('employees')) {
       // dispatch({type: 'REMOVE_EMPLOYEE'})
      }
    }
  }, [step.active])

  let main_filter = []
  if (filter.employee && Object.keys(filter.employee).length) {
    main_filter = onlyUniq(filter.employee, 'branches')
  }

  let service_filter = []
  if (filter.service && Object.keys(filter.service).length) {
    service_filter = onlyUniq(filter.service)
  }

  if (service_filter.length) {
    employees = employees.filter(emp => {
      let exc = true
      let inc = true
          exc = service_filter.filter(serv => emp.services.indexOf(serv) < 0).length == service_filter.length
          inc = service_filter.filter(serv => emp.services.indexOf(serv) > -1).length == service_filter.length
      let excl = emp.services_type == 'exclude' && exc
      let incl = emp.services_type == 'include' && inc
      return !emp.services.length || excl || incl
      })
  }


  if (main_filter.length) {
      branches = branches.filter(br => br.ids.filter(el => main_filter.indexOf(el) > -1).length > 0)
  }

  return (<div className={`oz_branches${active}`}>
            {branches.length ? 
            <ul className="filials">
              {branches.map(branch => <Branch branch={branch}/>)}
            </ul>
            :
            <>{oz_lang.r30}</>
            }
        </div>)
  }