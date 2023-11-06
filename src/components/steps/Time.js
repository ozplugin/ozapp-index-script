import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {TimeFormatted} from '../../functions/functions'

import onlyUniq from '../../functions/onlyUniq'


export default function Time() {
  let timerU, timerD, timerE
  const summary = useSelector(state => state.app_summary) 
  let dateText = useSelector(state => state.date) 
  const app = useSelector(state => state.app) 
  const employees = useSelector(state => state.employees) 
  const branch = useSelector(state => state.branch) 
  const steps = useSelector(state => state.steps)
  const step = useSelector(state => state.step)
  const services = useSelector(state => state.services)
  const s_mtime = useSelector(state => state.time)
  const service = useSelector(state => state.service)
  const service_mtime = service.length ?  services.reduce((cur,arr) => { 
    let sum = service.indexOf(arr.id) > -1 ? arr.w_time : 0; 
    return cur+sum;},0) : 0 
  const timeslots = useSelector(state => state.timeslots)
  const filter = useSelector(state => state.filter)
  const time = timeslots.time || []
  const activeStep = step.active;
  const currentStep = step.current;
  const isActive = activeStep == 'time';
  const isCurrent = currentStep == 'time';
  const active = isActive || isCurrent ? ' active' : '';
  const dispatch = useDispatch();
  let main_filter = []
  if (filter.employee && Object.keys(filter.employee).length) {
    main_filter = onlyUniq(filter.employee)
  }

  const setTime = (tm,ind, date, ids) => {
    if (main_filter.length != 1) {
    dispatch({
      type: 'SET_EMPLOYEE_ON_SKIP',
      payload: time[ind].persIds
    }) 
    }

    // если используется таймзон и дата отличается от выбранной в календаре
    if (!oz_app.u_tz() && date != summary.oz_start_date_field_id) {
      let da = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
      let fil =  app.schedule.filter(el => {
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
      dispatch({
          type: 'SET_DATE',
          payload: date
        }) 
  }
  
    dispatch({
      type: 'SET_FILTER',
      payload: {
        type: 'employee', 
        step: 'time',
        value: ids 
      }
    }) 
    oz_app.remove('mtime')
    let mtime = {}
    let check_mtime = !timeslots.all_times.length ? timeslots.time : timeslots.all_times
      check_mtime.map((id, index) => {
        if (tm.time == id.time) {
          let stop = false
          let ind = index
          while (!stop) {
            ind++;
            if(ind == check_mtime.length || check_mtime[ind]['class'].length) {
              let i = ind == check_mtime.length ? ind -1 : ind
              // если последнее время, добавляю один слот чтобы получить время окончания работы спеца
              let Time = ind == check_mtime.length && oz_app.get('b') ? moment(check_mtime[i].day+' '+check_mtime[i].time, 'DD.MM.YYYY HH:mm').add(oz_app.get('b'), 'minutes') : moment(check_mtime[i].day+' '+check_mtime[i].time, 'DD.MM.YYYY HH:mm')
              mtime[id.pId] = Time.diff(moment(tm.day+' '+tm.time, 'DD.MM.YYYY HH:mm'),'minutes')
              stop = true
            }
          }
        }        
        return id})
    oz_app.add({'mtime': mtime})
    dispatch({
        type: 'SET_TIME',
        payload: {time: tm.time, mtime}
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

  // useEffect(() => {
  //   if (step.active != step.current && step.active == 'time') {
  //   let nextStep = steps.indexOf(activeStep)
  //   if (typeof steps[nextStep+1] != 'undefined') {
  //     dispatch({type: 'LOADING'})
  //     dispatch({
  //         type: 'SET_ACTIVE_STEP',
  //         payload: steps[nextStep+1]
  //     })
  //   }
  // }
  // }, [step])

  useEffect(() => {
    if (step.active != step.current && step.active == 'time') {
      
      if (app?.quick_time) {
        let nextStep = steps.indexOf(activeStep)
        if (typeof steps[nextStep+1] != 'undefined') {
          dispatch({
            type: 'SET_TIME',
            payload: {time: app?.q_time}
          }) 
            dispatch({type: 'LOADING'})
            dispatch({
                type: 'SET_ACTIVE_STEP',
                payload: steps[nextStep+1]
            })
        } 
        return; 
      }
      oz_app.add({dateText})
      let pId = 0
      let apps = []
      let time = []
      let all_times = []
      if (!step.reverse) {
        if (main_filter.length == 1) {
          pId = main_filter[0]
          oz_app.add({pId:main_filter[0]})

          let emp = employees.map(em => em.id).indexOf(main_filter[0])
          if (emp > -1) {
            apps = employees[emp].apps
            if (employees[emp].breaks) {
              oz_app.add({'breaks': employees[emp].breaks})
            }
          }
          time = oz_app.forTime(dateText, pId,apps)
          all_times = time
        }
        else if (main_filter.length > 1) {
              let emps = employees.filter(emp => {
                let exc = true
                let inc = true
                let excl = true
                let incl = true
                if (service.length) {
                    exc = service.filter(serv => emp.services.indexOf(serv) < 0).length
                    inc = service.filter(serv => emp.services.indexOf(serv) > -1).length
                    excl = emp.services_type == 'exclude' && exc == service.length
                    incl = emp.services_type == 'include' && inc == service.length
                }
                return main_filter.indexOf(emp.id) > -1 && (!emp.services.length || excl || incl)
              })
              let rasp = app.schedule
              if (rasp.length) {
                let day_format = moment(dateText, 'DD.MM.YYYY').format('YYYY-MM-DD')
                let useTz = !oz_app.u_tz()
                rasp = rasp.filter(ras => useTz ? ras.timezone.indexOf(day_format) > -1 : day_format == ras.day).map(el => el.pId)
                if (rasp.length)
                emps = emps.filter(emp => rasp.indexOf(emp.id) > -1)
              }
              time = emps.reduce((sch,emp) => {
                if (emp.breaks) oz_app.add({'breaks': emp.breaks})
                let sd = oz_app.forTime(dateText, emp.id,emp.apps)
                oz_app.remove('breaks')
                return [...sch, ...sd]}, []);

                // убираем дубли времени. если есть одинаковое время, то стараемся оставить только то время, которое свободно
                all_times = time
                time = time.reduce(function(acc, val) {
                  var index = -1
                  var index = acc.map(function(value) {
                    return value['time']
                    }).indexOf(val['time'])
                  if (index > -1) {
                    if (val['class'].length == 0) {
                          let persIds = acc[index].class.length == 0 ? acc[index].persIds.concat(val.pId) : [val.pId]  
                    acc[index] = {...val,persIds}
                    }
                  }
                  else {
                    acc.push({...val, persIds:[val.pId]})
                  }
                  return acc
                }, [])
                time = time.sort((a,b) => moment(a.time, 'HH:mm').unix() - moment(b.time, 'HH:mm').unix())
        }
      }


      dispatch({type: 'LOADED'})
       dispatch({
        type: 'SET_TIME_SLOTS',
        payload: {time,all_times}
        }) 
      dispatch({
        type: 'SET_CURRENT_STEP',
        payload: 'time'
      })
    }
    else {
      if (Object.keys(s_mtime).length && steps.indexOf(step.active) < steps.indexOf('time') && step.reverse) {
      dispatch({
                type: 'SET_TIME',
                payload: {}
              })
      }
    }
    }, [step])
    timerU = useMemo(() => time.filter(function(el) { let ti = !oz_app.u_tz() ? moment(el.time+' '+oz_app.ctzt(), 'HH:mm Z').format('HH:mm').split(':')[0] : el.time.split(':')[0]; return ti < 12 && el['class'].length == 0 }), [time])
    timerD = useMemo(() => time.filter(function(el) { let ti = !oz_app.u_tz() ? moment(el.time+' '+oz_app.ctzt(), 'HH:mm Z').format('HH:mm').split(':')[0] : el.time.split(':')[0]; return ti > 11 && ti < 18 && el['class'].length == 0 }), [time])
    timerE = useMemo(() => time.filter(function(el) { let ti = !oz_app.u_tz() ? moment(el.time+' '+oz_app.ctzt(), 'HH:mm Z').format('HH:mm').split(':')[0] : el.time.split(':')[0]; return ti > 17 && el['class'].length == 0 }), [time])
return (<div className={`oz_time ${active}`}>
        {time.length && time.filter(el => el.class.length == 0).length ?
        <ul>
            {time.map((tim, ind) => {
              let dayPartTime = tim.time
              let separator = null
              if (!oz_app.u_tz()) {
                dayPartTime = moment(dayPartTime+' '+oz_app.ctzt(), 'HH:mm Z').format('HH:mm').split(':')[0]
              }
              if (timerU && dayPartTime.split(':')[0] < 12) {
                let no_slots = timerU.length == 0 ? 'no_slots' : '';
                timerU = false;
                separator = <li key='timerU' className={`zagday timerU squaredThree ${no_slots}`}>{oz_lang.str2}</li>
              }

              if (dayPartTime.split(':')[0] > 11 && dayPartTime.split(':')[0] < 18 && timerD) {
                let no_slots = timerD.length == 0 ? 'no_slots' : '';
                timerD = false;
                separator = <li key='timerD' className={`zagday timerD squaredThree ${no_slots}`}>{oz_lang.str3}</li>
              }

              if (dayPartTime.split(':')[0] > 17 && timerE) {
                let no_slots = timerE.length == 0 ? 'no_slots' : '';
                timerE = false;
                separator = <li key='timerE' className={`zagday timerE squaredThree ${no_slots}`}>{oz_lang.str4}</li>
              }

                return <>
                      {separator}
                      <li key={ind} data-persIds={tim.persIds ? tim.persIds : tim.pId } className={`squaredThree ${tim['class'].join(' ')}`}>
                         <input onChange={(e) => {let ids = tim.persIds ? tim.persIds : [tim.pId]; setTime(tim,ind, tim.day, ids)}} id={`time-${ind}`} className="checkb" type="checkbox" value={tim.time} />
                        <label for={`time-${ind}`}>{TimeFormatted(tim.time)} {service_mtime > 0 && ' - ' + TimeFormatted(moment(tim.time, 'HH:mm').add(service_mtime, 'minutes').format('HH:mm'))}</label>
                      </li>
                    </>
            })}
        </ul>
        :
         oz_lang.str13 }
        </div>)
  }