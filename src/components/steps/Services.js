import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Service from '../modules/Service'
import Cat from '../modules/Cat'

import onlyUniq from '../../functions/onlyUniq'
import store from '../../store'


export default function Services(props) {
  const asyncElements = useSelector(state => state.asyncElements);
  const [hasCats, setCats] = useState(false);
  const services = useSelector(state => state.services);
  const services_cats = useSelector(state => state.services_cats);
  const filter = useSelector(state => state.filter);
  const service = useSelector(state => state.service);
  const time = useSelector(state => state.time);
  const cat = useSelector(state => state.cat);
  const employees = useSelector(state => state.employees);
  const app_summary = useSelector(state => state.app_summary);
  //const employee = app_summary.oz_personal_field_id;
  const employee = useSelector(state => state.employee);
  const steps = useSelector(state => state.steps);
  const step = useSelector(state => state.step)
  const activeStep = step.active;
  const isActive = step.current == 'services';
  const active = isActive ? ' active' : '';
  const dispatch = useDispatch();

  const nextStep = () => {
    let mt = []
    if (typeof time.mtime != 'undefined' && time.mtime !== false) {
      mt= Object.keys(time.mtime).filter(el => time.mtime[el] >= 0).map(el => Number(el))
    }
    let em = employees
    if (service.length && services.filter(el => service.indexOf(el.id) > -1).filter(el => el.owner).length) {
      let fil = services.filter(el => service.indexOf(el.id) > -1).filter(el => el.owner).map(el => el.owner).filter((value, index, self) => self.indexOf(value) === index)
        em = fil
      }
      else {
      em = employees.filter(emp => {
      let by_mtime = true
      if (mt.length ) {
          by_mtime = mt.indexOf(emp.id) > -1
      }
      let exc = true
      let inc = true
      if (service.length) {
          exc = service.filter(serv => emp.services.indexOf(serv) < 0).length == service.length
          inc = service.filter(serv => emp.services.indexOf(serv) > -1).length == service.length
      }
      let excl = emp.services_type == 'exclude' && exc
      let incl = emp.services_type == 'include' && inc
      return by_mtime && (!emp.services.length || excl || incl)
      }).map(el => el.id)
    }
    if (em.length) {
      dispatch({
        type: 'SET_FILTER',
        payload: {
            type: 'employee', 
            step: 'services',
            value: em
        }
        }) 
    }
    else {
      dispatch({
        type: 'SET_FILTER',
        payload: {
            type: 'service', 
            step: 'services',
            value: service
        }
        }) 
    }
    let nextStep = steps.indexOf(activeStep)
    if (typeof steps[nextStep+1] != 'undefined')
    dispatch({
        type: 'SET_ACTIVE_STEP',
        payload: steps[nextStep+1]
      })
  }

  let filter_by_available_employee = []
  let main_filter = []
  if (filter.employee && Object.keys(filter.employee).length) {
    main_filter = onlyUniq(filter.employee, 'services')
    filter_by_available_employee = employees.filter(emp => main_filter.indexOf(emp.id) > -1)
  }

 useEffect(async () => {
  if (step.active != step.current && step.active == 'services') {
    if (asyncElements.indexOf('services_cats') < 0 && asyncElements.indexOf('services') < 0) {
        let params = new URLSearchParams();
        params.set('action', 'oz_get_services')
        params.set('type', 'all')
        if (oz_vars.atts && Object.keys(oz_vars.atts).length) {
          if (oz_vars.atts.employee) {
            let servFilter = {}
            let hasUsl = false;
            employees.forEach(emp => {
                if (emp.id == Number(oz_vars.atts.employee)) {
                    if (emp.services_type == 'include') {
                      servFilter.post__in = emp.services
                      hasUsl = true
                    }
                    else if (emp.services_type == 'exclude') {
                      servFilter.post__not_in = emp.services
                      hasUsl = true
                    }
                }
            })
            if (hasUsl) {
              oz_vars.atts = {...oz_vars.atts, ...servFilter}
            }
          }
          params.set('query', JSON.stringify(oz_vars.atts))
        }
        const result = await (await fetch(
          oz_vars.oz_ajax_url, {
            method: 'post',
            body: params
          }
        )).json();
        if (result.success) {
          if (result.payload.type == 'all' || result.payload.type == 'services') {
            let list = result.payload.type == 'all' ? result.payload.result.services.list : result.payload.result.list
            dispatch({
              type: 'SET_LOADED',
              payload: 'services',
            })
            dispatch({type: 'LOADED'})
            dispatch({
              type: 'SET_SERVICES',
              payload: list
            })
            if (result.payload.type == 'all' && result.payload.result.services_cats)
            dispatch({
              type: 'SET_CATS',
              payload: result.payload.result.services_cats.list
            })
            // если одна услуга и включен пропуск
            let isOwner = list.length == 1 && main_filter.length && list[0].owner ? main_filter.indexOf(list[0].owner) > -1 : true 
            if (list.length == 1 && oz_vars.skipOneStep && isOwner) {
              let service_restore = steps.indexOf(step.current)
              let nextStep = steps.indexOf('services')
              nextStep = steps[nextStep + 1]    
              let newSteps = steps.filter(step => step != 'services')
              let value = list.map(e => Number(e.id))
              // fix если одна услуга, то шаг рекурринг задал вручную, т.к. в app useselector вызывается позже
              if (list[0].recurring) {
                nextStep = nextStep == 'form' ? 'recurring' : nextStep
              }
              dispatch({
                type: 'SKIP_IF_ONE_SERVICE',
                payload: {
                  'steps' : newSteps,
                  'next' : nextStep,
                  'id' : value,
                  service_restore
                }
              })
              setTimeout( () => {
                dispatch({
                  type: 'SET_FILTER',
                  payload: {
                      type: 'service', 
                      step: 'services',
                      value
                    }                
                })
                if (list[0].owner) {
                  dispatch({
                    type: 'SET_FILTER',
                    payload: {
                        type: 'employee', 
                        step: 'services',
                        value: [list[0].owner]
                      }                
                  })
                }
              }, oz_vars.animation)              
            }
              else {
                dispatch({
                  type: 'SET_CURRENT_STEP',
                  payload: 'services'
                })
              }
          }
          else if (result.payload.type == 'services') {
            if (asyncElements.indexOf('services') < 0)
            dispatch({
              type: 'SET_LOADED',
              payload: 'services',
            })
            dispatch({type: 'LOADED'})
              dispatch({
                type: 'SET_SERVICES',
                payload: result.payload.result.list
              })

          // если одна услуга и включен пропуск
          let isOwner = result.payload.result.list.length == 1 && main_filter.length && result.payload.result.list[0].owner ? main_filter.indexOf(result.payload.result.list[0].owner) > -1 : true 
            if (result.payload.result.list.length == 1 && oz_vars.skipOneStep && isOwner) {
              let service_restore = steps.indexOf(step.current)
              let nextStep = steps.indexOf('services')
              nextStep = steps[nextStep + 1]    
              let newSteps = steps.filter(step => step != 'services')
              let value = result.payload.result.list.map(e => Number(e.id))
              dispatch({
                type: 'SKIP_IF_ONE_SERVICE',
                payload: {
                  'steps' : newSteps,
                  'next' : nextStep,
                  'id' : value,
                  service_restore
                }
              })
              setTimeout( () => {
                dispatch({
                  type: 'SET_FILTER',
                  payload: {
                      type: 'service', 
                      step: 'services',
                      value
                    }                
                })
              }, oz_vars.animation)              
            }
              else {
                dispatch({
                  type: 'SET_CURRENT_STEP',
                  payload: 'services'
                })
              }
          }
          else if (result.payload.type == 'categories') {
            if (asyncElements.indexOf('services_cats') < 0)
            dispatch({
              type: 'SET_LOADED',
              payload: 'services_cats',
            })
              let newsteps = steps.reduce((arr,el) => {
                if (el == 'services' && arr.indexOf('services_cats') < 0)
                arr.push('services_cats')
                arr.push(el) 
                return arr;
                },[])
              dispatch({
                type: 'SET_STEPS',
                payload: newsteps
              })
              dispatch({
                type: 'SET_CATS',
                payload: result.payload.result.list
              })
              dispatch({
                type: 'SET_ACTIVE_STEP',
                payload: 'services_cats'
              })          
          }
        }
      }
      else {
        dispatch({type: 'LOADED'})
        let isOwner = services.length == 1 && main_filter.length && services[0].owner ? main_filter.indexOf(services[0].owner) > -1 : true 
        if (services.length == 1 && oz_vars.skipOneStep && isOwner) {
          let service_restore = steps.indexOf(step.current)
          let nextStep = steps.indexOf('services')
              nextStep = steps[nextStep + 1]    
          let newSteps = steps.filter(step => step != 'services')
          dispatch({
            type: 'SKIP_IF_ONE_SERVICE',
            payload: {
              'steps' : newSteps,
              'next' : nextStep,
              'id' : services.map(e => Number(e.id)),
              service_restore
            }
          })
          setTimeout(() => {
            dispatch({
              type: 'SET_FILTER',
              payload: {
                  type: 'service', 
                  step: 'services',
                  value: services.map(e => Number(e.id)),
                }                
            })
          }, oz_vars.animation)
        }
        else {
          dispatch({
            type: 'SET_CURRENT_STEP',
            payload: 'services'
          })
        }
        }
    }
    else {
      if (service.length && steps.indexOf(step.active) > -1 && steps.indexOf(step.active) < steps.indexOf('services')) {
        dispatch({
          type: 'REMOVE_SERVICE',
          payload:service
        })
      }
    }
  }, [activeStep])

  let seres = services
      seres = services.filter(service => {
        let usl = true
        if (service.cats && cat) {
            usl = service.cats.indexOf(cat) > -1
        }

        if (usl && filter_by_available_employee.length) {
          let filter_by_services = filter_by_available_employee.filter(emp => {
            let owner = service.owner ? service.owner == emp.id : true; 

            let excl = emp.services_type == 'exclude' && emp.services.indexOf(service.id) < 0
            let incl = emp.services_type == 'include' && emp.services.indexOf(service.id) > -1
            return (!emp.services.length || excl || incl) && owner;
          })
          usl = filter_by_services.length > 0
        }

        return usl}) 

  if (!seres.length && (asyncElements.indexOf('services_cats') > -1 || asyncElements.indexOf('services') > -1)) {
    return (<div className={`oz_services${active}`}>
      <div>{oz_lang.servnotfound}</div>
    </div>)   
  }


  if (services_cats && services_cats.length) {
    return (<div className={`oz_services${active}`}>
      {services_cats.map((cat, i) => {
        let serv = seres.filter(ser => cat.services && cat.services.indexOf(ser.id) > -1)
        return serv.length > 0 ? <Cat isOpen={i == 0 && !oz_vars.collapsedCats} cat={cat} services={serv}/> : null
      })}
    </div>)
  }

return (<div className={`oz_services${active}`}>
      <ul className="listUslug">{seres.map(service => <Service service={service} />)}</ul>
      </div>)
  }