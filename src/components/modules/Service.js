import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import onlyUniq from '../../functions/onlyUniq'

export default function Service(props) {
    const service = props.service
    const id = service.id
    const exist = useSelector(state => state.service);
    const services = useSelector(state => state.services);
    const steps = useSelector(state => state.steps);
    const step = useSelector(state => state.step)
    const employees = useSelector(state => state.employees)
    const filter = useSelector(state => state.filter);
    const time = useSelector(state => state.time)
    const dispatch = useDispatch();
    const activeStep = step.active;
    const isActive = exist.indexOf(id) > -1
    const checked = isActive ? ' checked' : '' 
    let service_time = service.w_time
    if (service.buffer[1]) {
        service_time = service_time + service.buffer[1]
        // usl = time.mtime !== false && time.mtime <= service_time // пока что закомментил. если выбрано несколько услуг, как определить время?
    }

    let main_filter = []
    if (filter.employee && Object.keys(filter.employee).length) {
      main_filter = onlyUniq(filter.employee)
    }
    let usl = false 
    let mtimetotal = 0
    if (typeof time.mtime != 'undefined' && time.mtime !== false) {
        let filter_by_mtime = []
        for (let key in time.mtime) {
            if (time.mtime[key] < service_time) {
                        mtimetotal++
            }
            else {
                filter_by_mtime.push(parseInt(key)) 
            }
        }
        usl = Object.keys(time.mtime).length == mtimetotal
        if (filter_by_mtime.length) {
            let em = employees
                if (service.owner) {
                em = em.filter(el => el.id == service.owner)
                }
                em = em.filter(emp => {
                let exc = true
                let inc = true
                let by_main_filter = true
                if (main_filter.length) {
                    by_main_filter =  main_filter.indexOf(emp.id) > -1
                }
                if (exist.length) {
                    exc = exist.filter(serv => emp.services.indexOf(serv) < 0).length
                    inc = exist.filter(serv => emp.services.indexOf(serv) > -1).length
                }
                let excl = emp.services_type == 'exclude' && emp.services.indexOf(id) < 0 && exc
                let incl = emp.services_type == 'include' && emp.services.indexOf(id) > -1 && inc
                return by_main_filter && filter_by_mtime.indexOf(emp.id) > -1 && (!emp.services.length || excl || incl)
              })
              usl = em.length < 1
        }
    }
    const deactive = usl ? ' deactive' : '' 
    const setService = useCallback((id, e) => {
        if (e) {
        e.preventDefault();
        if (e.currentTarget.className.indexOf('deactive') > -1) return;
        }

        dispatch({
            type: 'REMOVE_FILTER',
            payload: 'services',
            })

        let action = 'SET_SERVICE'
        let payload = id
        if (isActive && oz_vars.multiservice ) {
            action = 'REMOVE_SERVICE'
        }
            dispatch({
                type: action,
                payload
              })

              let serv = action == 'SET_SERVICE' ? exist : exist.filter(el => el != id)

              dispatch({
                type: 'SET_FILTER',
                payload: {
                    type: 'service', 
                    step: 'services',
                    value: !oz_vars.multiservice ? [id] : serv
                }
                }) 

        if (typeof time.mtime != 'undefined' && time.mtime !== false) {
            let newmTime = {}
            for (let k in time.mtime) {
                let mtim = time.mtime[k]
                if (action == 'SET_SERVICE') {
                    newmTime[k] = mtim - service_time
                }
                else {
                    newmTime[k] = mtim + service_time
                }
            }
            dispatch({
                type: 'SET_MTIME',
                payload: newmTime
                })
            let emps = Object.keys(newmTime).map(el => Number(el))
            if (service.owner && action == 'SET_SERVICE') {
                emps = emps.filter(el => el == service.owner)
            }
            dispatch({
                type: 'SET_FILTER',
                payload: {
                    type: 'employee', 
                    step: 'services',
                    value: emps
                }
                }) 
        }

        else if (service.owner && action == 'SET_SERVICE') {
            dispatch({
                type: 'SET_FILTER',
                payload: {
                    type: 'employee', 
                    step: 'services',
                    value: [service.owner]
                }
                })  
        }


        if (!oz_vars.multiservice) {
            let nextStep = steps.indexOf(activeStep)
            if (typeof steps[nextStep+1] != 'undefined') {
                let stepName = steps[nextStep+1]
                // fix если отключен мультивыбор и след услуга повторяющаяся
                if (services.filter(s => s.id == id && s.recurring).length && stepName == 'form') {
                    stepName = 'recurring'
                } 
                dispatch({
                    type: 'SET_ACTIVE_STEP',
                    payload: stepName
                })
            }
        }
        else {
        }
        })
    return (
<li onClick={(e) => {setService(id,e)}} className={`usluga${checked}${deactive}`}>
    {service.badge && <span className="oz_badge oz_badge-right">{service.badge}</span> }
	<p className="uslname">{service.title}</p>
	<div className="params_usl">
    {service.w_time > 0 && 
		<div className="oz_usl_time">
			{service.w_time}					
			<span className="oz_op">{oz_lang.r7}</span>
		</div>
    }
    {service.price > 0 && 
		<div className="oz_usl_price">
			{service.price}					
			<span className="oz_op">{oz_lang.r8} {oz_vars.currency && '('+oz_vars.currency+')'}</span>
		</div>
    }
    {service.description && 
        <div class="oz_serv_content" dangerouslySetInnerHTML={ {__html: service.description} } />
    }
	</div>
</li>        
    )
}