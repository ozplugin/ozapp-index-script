import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// import DatePicker from "react-datepicker";
 
// import "react-datepicker/dist/react-datepicker.css";

import createCalendar from '../old_functions/createCalendar'
import store from '../../store'
import onlyUniq from '../../functions/onlyUniq'


export default function Date() {
  const app = useSelector(state => state)
  const steps = useSelector(state => state.steps)
  const filter = useSelector(state => state.filter)
  const step = useSelector(state => state.step)
  const branch = useSelector(state => state.branch)
  const employees = useSelector(state => state.employees)
  const employee = useSelector(state => state.employee)
  const activeStep = step.active;
  const active = step.current == 'date' ? ' active' : '';
  const dispatch = useDispatch();
  const setStartDate = (date) => {
      let dt = store.getState()
      if (dt && typeof dt.app.schedule != 'undefined') {
        let da = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
        let fil =  dt.app.schedule.filter(el => {
          return (!oz_app.u_tz() && el.timezone.indexOf(da) > -1) || el.day == da
        })
        .map(el => el.pId).filter((value, index, self) => self.indexOf(value) === index)
        dispatch({
          type: 'SET_FILTER',
          payload: {
            type: 'employee', 
            step: 'date',
            value: fil
          }
        }) 
      }
      
      dispatch({
        type: 'SET_QUICKTIME',
        payload: {
            quick_time: false,
            date:null, 
            time:null
        }            
    })      

    dispatch({
        type: 'SET_DATE',
        payload: date
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
    if (step.active != step.current && step.active == 'date') {


      if (app.app?.quick_time) {
        let nextStep = steps.indexOf(activeStep)
        if (typeof steps[nextStep+1] != 'undefined') {
          let date = moment(app.app?.q_date, 'YYYY-MM-DD').format('DD.MM.YYYY')
          dispatch({
            type: 'SET_DATE',
            payload: date
          }) 
            dispatch({type: 'LOADING'})
            dispatch({
                type: 'SET_ACTIVE_STEP',
                payload: steps[nextStep+1]
            })
        }  
      }

      dispatch({
        type: 'REMOVE_APP',
        payload: ['schedule', 'daysoff', 'date']
      })
      let emps = await loadEmployees()

      // если один сотрудник и включен пропуск
      if (emps.length == 1 && (oz_vars.skipOneStep || oz_vars.employee_page)) {
        let nextStep = steps.indexOf('employees')
        let employee_restore = steps.indexOf(step.current)
        nextStep = steps[nextStep + 1]    
        let newSteps = steps.filter(step => step != 'employees')
        let value = emps.map(e => Number(e.id))
        dispatch({
          type: 'SKIP_IF_ONE_EMPLOYEE',
          payload: {
            'steps' : newSteps,
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
      dispatch({type: 'LOADED'})
      dispatch({
        type: 'SET_CURRENT_STEP',
        payload: 'date'
        })

        let schedule = []
        let daysoff = []
        let daysoff_formatted = [] // todo main format YYYY-MM-DD
        let ind = []
        let main_filter = []
        if (filter.employee && Object.keys(filter.employee).length) {
          main_filter = onlyUniq(filter.employee)
        }

        if (main_filter.length) {
          emps = emps.filter(emp => main_filter.indexOf(emp.id) > -1)
        } 
        
        let service_filter = []
        if (filter.service && Object.keys(filter.service).length) {
          service_filter = onlyUniq(filter.service)
        }
        if (service_filter.length) {
          emps = emps.filter(emp => {
            let exc = true
            let inc = true
                exc = service_filter.filter(serv => emp.services.indexOf(serv) < 0).length == service_filter.length
                inc = service_filter.filter(serv => emp.services.indexOf(serv) > -1).length == service_filter.length
            let excl = emp.services_type == 'exclude' && exc
            let incl = emp.services_type == 'include' && inc
            return !emp.services.length || excl || incl
            })
        }        
          if (emps.length) {
                emps.forEach(el => {
                      if (el.daysOff) {
                        let dof = {}
                        dof[el.id] = el.daysOff.join()
                        dof['pId'] = el.id
                        daysoff.push(dof)
                        daysoff_formatted.push({
                          days: el.daysOff.map(el => moment(el, 'DD.MM.YYYY').format('YYYY-MM-DD')),
                          pId: el.id
                        })
                      }

                      if (typeof el.schedule == 'object') {
                        el.schedule.forEach(e => schedule.push(e))
                      }
                      else 
                      schedule.push(el.schedule)
                    })
          }
        let sched = createCalendar({onSelect: setStartDate}, schedule, daysoff)
        sched = sched.filter(el => daysoff_formatted.filter(e => e.pId == el.pId && e.days.indexOf(el.day) > -1).length < 1)
        dispatch({
          type: 'SET_APP',
          payload: {schedule: sched, daysoff}
        })
    }
    else {
      if (step.reverse && step.prev == 'date') {
        setTimeout(() => {jQuery('.inlinedatepicker').datepicker('destroy')}, oz_vars.animation)
      }
    }
  }, [activeStep])

  const loadEmployees =  async () => {
    let emps = []
    if (employees.length) return employees;
    let params = new URLSearchParams();
    dispatch({type:'LOADING'})
    params.set('action', 'oz_get_employees')
    params.set('type', 'all')
    if (oz_vars.atts && Object.keys(oz_vars.atts).length) {
      params.set('query', JSON.stringify(oz_vars.atts))
    }
    const result = await (await fetch(
      oz_vars.oz_ajax_url, {
        method: 'post',
        body: params
      }
    )).json();
    dispatch({type: 'LOADED'})
    if (result.success) {
      if (result.payload.type == 'all' && typeof result.payload.result.branches != 'undefined') {
        // филиалы
        dispatch({
          type: 'SET_LOADED',
          payload: 'branches',
        })
        let newstepsIndex = steps.indexOf('employees')
        if (newstepsIndex > 0) {
        let newsteps = steps
        newsteps.splice(newstepsIndex,1, 'branches', 'employees')
          dispatch({
            type: 'SET_STEPS',
            payload: newsteps
          })
          dispatch({
            type: 'SET_BRANCHES',
            payload: typeof result.payload.result.branches.list != 'undefined' ? result.payload.result.branches.list : []
          })
        }
      }

      emps = result.payload.type == 'employees' ? result.payload.result.list : result.payload.result.employees.list
      // сотрудники
      dispatch({
        type: 'SET_LOADED',
        payload: 'employees',
      })
        dispatch({
          type: 'SET_EMPLOYEES',
          payload: emps
        })

     
    }
    return emps;
  }


  useEffect( () => () => jQuery('.inlinedatepicker').datepicker('destroy'), [] );

  return <div className={`oz_date${active}`}><div className="inlinedatepicker" /></div>

  }