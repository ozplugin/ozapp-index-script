import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Field from '../modules/Field'
import ServiceLine from '../modules/ServiceLine'

import onlyUniq from '../../functions/onlyUniq'

import submitForm from '../../functions/submitForm'

import {TimeFormatted, DateVisual} from '../../functions/functions'
import AppointmentInfo from '../modules/AppointmentInfo';




export default function Form() {
    const summary = useSelector(state => state.app_summary);
    const app = useSelector(state => state.app);
    let def_services = useSelector(state => state.services);
    const deposits = useSelector(state => state.app_summary.oz_use_deposit)
    let services = []
    if (summary.oz_uslug_set)
        services = def_services.filter(serv => summary.oz_uslug_set.indexOf(serv.id) > -1)
    const filter = useSelector(state => state.filter) 
    let employees = useSelector(state => state.employees)
    let check_employee = onlyUniq(filter.employee)
    let employee =  employees.filter(emp => summary.oz_personal_field_id == emp.id)
    const time =  useSelector(state => state.time)
    const steps = useSelector(state => state.steps)
    const step = useSelector(state => state.step)
    const activeStep = step.active;
    const active = activeStep == 'form' ? ' active' : '';
    let sum = services.reduce((sm,ser) => {
        let price = deposits && deposits.indexOf(ser.id) > -1 ? ser.deposit.value : ser.price
        return sm+price
    },0);
    let isRecurring = services.filter(serv => serv.recurring).length
    //const [fields, validateFields] = useState(oz_vars.fields)
    const fields = useSelector(state => state.form_fields)
    const form_fields = oz_vars.fields
    const updatePricesonRecur = summary.recurring
    const IsCompleted = app && app.completed ? 'oz_completed' : false


    const dispatch = useDispatch();


    useEffect(() => {
        if (def_services.length && !app.old_price) {
        let recur = oz_app.get('recurring')
        if (updatePricesonRecur && updatePricesonRecur.length && recur.params.pay == 'all') {
            sum = sum * (recur.generated.length +1)
        }
        dispatch({
            type: 'SET_SUM',
            payload: sum
          })  
        }  
    }, [sum, updatePricesonRecur, deposits])

    useEffect(() => {
        if (step.active != step.current && step.active == 'form') {
                if (app.skip_employee) {
                    let filter_by_available_employee = []
                    if (employees && check_employee) {
                      filter_by_available_employee = employees.filter(emp => {
                          let exc = services.filter(serv => emp.services.indexOf(serv.id) < 0)
                          let inc = services.filter(serv => emp.services.indexOf(serv.id) > -1)
                          let excl = emp.services_type == 'exclude' && exc.length && exc.length == services.length
                          let incl = emp.services_type == 'include' && inc.length && inc.length == services.length
                          return check_employee.indexOf(emp.id) > -1 && (!emp.services.length || excl || incl)
                        }).map(emp => emp.id)
                    }
                    if (time.mtime !== false) {
                        let mtime = time.mtime
                        services.map(el => {
                            if (mtime && Object.keys(mtime).length > 0) {
                                for (let key in mtime) {
                                    if (mtime < parseInt(el.buffer[0] + el.w_time) && filter_by_available_employee.indexOf(parseInt(key)) > -1)
                                    filter_by_available_employee.splice(filter_by_available_employee.indexOf(parseInt(key)), 1)
                                }
                            }

                            //service.indexOf(el.id) > -1
                            return el})
                    }

                    if (filter_by_available_employee.length)
                    dispatch({
                        type: 'SET_SUMMARY',
                        payload: {oz_personal_field_id : filter_by_available_employee[0]}
                      })                
                }
            dispatch({type: 'LOADED'})
            dispatch({
                type: 'SET_CURRENT_STEP',
                payload: 'form'
              })
        }

        if (step.reverse && app.skip_employee) {
            let razn = Math.abs(steps.indexOf('form') - steps.indexOf(step.active))
            if (razn == 1 && summary.oz_personal_field_id) {
                    dispatch({
                        type: 'REMOVE_SUMMARY',
                        payload: 'oz_personal_field_id'
                      })                
            }
        }
    })

const checkValidaty = () => {
    dispatch({type: 'CHECK_VALIDATY'})
    setTimeout(() => {
        dispatch({type: 'CHECK_VALIDATY'})        
    }, 1000)
}

const handleOnSubmit = (e) => {
    e.preventDefault()
	var event= new CustomEvent('ozBookSubmit');
	document.addEventListener('ozBookSubmit',function(){},false);
    document.dispatchEvent(event);
    checkValidaty()
    let isValid = !fields.not_valid.length
    if (isValid) {
        submitForm()
    }
    else {
        let top = document.querySelector('.oz_input-label[for="'+fields.not_valid[0]+'"]')
        if (top) {
            top.scrollIntoView({block: "center", behavior: "smooth"});
            setTimeout(() => {top.scrollIntoView({block: "center", behavior: "smooth"});}, 50)
        }
        else {
            document.getElementById('timeForm').scrollIntoView({block: "center", behavior: "smooth"});
        }
        // let coor = 0
        // if (top) {
        //     coor = top.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2)
        // }
        // else {
        //     let form = document.getElementById('timeForm')
        //     coor = form.getBoundingClientRect().top + window.scrollY
        // }
        // window.scrollTo({
        //     top: coor,
        //     behavior: "smooth"
        // });
    }
}

useEffect(() => {
    
}, [fields])


return ( <div id="timeForm" className={active}>
			<div className="oz_form_wrap">
				<div className="oz_zapis_info">
                    { !IsCompleted  ?
                    <>
					<p>
                    {(!app.skip_employee && !(employees.length == 1 && (oz_vars.skipOneStep || oz_vars.employee_page)) ) &&
                        <span className="oz_spec_info">
                            {oz_lang.r15}: <span>{employee.map(ser => ser.title).join(', ')}</span>
                        </span>
                    }
                        
                        {(summary.oz_start_date_field_id && summary.oz_time_rot) &&
                        <span className="oz_datetime_info">
                        {summary.oz_start_date_field_id &&
                            <span className="oz_datetime_info-date">
                                {oz_lang.r16}: <span className="oz_date_info">{DateVisual(summary.oz_start_date_field_id, summary.oz_time_rot, 'DD.MM.YYYY')}</span>
                            </span> }
                            {summary.oz_time_rot &&
                            <span className="oz_datetime_time">{' '}
                                {oz_lang.r17} <span className="oz_time_info">{TimeFormatted(summary.oz_time_rot)}</span>
                            </span>
                            }
                        </span>
                        }

                        {(services.length > 0 && !(def_services.length == 1 && oz_vars.skipOneStep) ) && 
                        <span className="oz_usluga_info">
                            {oz_lang.r18}: <span>{services.map((ser, i) => <ServiceLine isLast={i == services.length - 1} service={ser}/>)}</span>
                        </span>
                        }
                        {summary.oz_order_sum > 0 &&
                        <span className="oz_amount_info">
                            {oz_lang.r19}: <span>{oz_vars.currency_position == 'left' ? oz_vars.currency : ''} {app.old_price && <del>{Number(app.old_price.toFixed(2))}</del>} {summary.oz_order_sum} {!oz_vars.currency_position || oz_vars.currency_position == 'right' ? oz_vars.currency : ''}</span> 
                        </span>
                        }
                        {(isRecurring != false && summary.recurring && summary.recurring.length > 0) &&
                        <span className="oz_recurring_info">{oz_lang.rec24}: 
                        {summary.recurring.map(el => <span>{DateVisual(el.day, el.time, 'DD.MM.YYYY')} {TimeFormatted(el.time)}</span>)}
                        </span>
                        }
                        <span className="oz_itog_mess">
                            {oz_lang.r20}
                        </span>
					</p>
                        </>
                    :
                    <AppointmentInfo />
                    }
				</div>
                <form action={oz_vars.oz_ajax_url} onSubmit={handleOnSubmit} method="post" className={`oz-form ${IsCompleted}`} novalidate="novalidate">
					<input type="hidden" name="action" value="do_zapis" />
                    <input type="hidden" name="oz_uslug_set" value={summary.oz_uslug_set} />
					<input type="hidden" name="oz_start_date_field_id" value={summary.oz_start_date_field_id} />
					<input type="hidden" name="oz_personal_field_id" value={summary.oz_personal_field_id} />
					<input type="hidden" name="oz_time_rot" value={summary.oz_time_rot} />
					<input type="hidden" name="oz_filials" value="" />
					<input type="hidden" name="oz_remList" value="" />
                    {summary.oz_order_sum > 0 &&
                    <>
					<input type="hidden" name="oz_payment_method" value="local" />
                    <input type="hidden" name="oz_order_sum" value={summary.oz_order_sum} />
                    </>
                    }

                    <div className="form_fields">
                        {form_fields.length > 0 &&  
                            form_fields.map(field => <Field field={field} />)
                        }
                        <label className="text-center oz_submit_label">
                            <span>
                                <input type="submit" value={oz_lang.r21} disabled={fields.checking} className="oz_submit oz_btn" />
                            </span>
                        </label>
                        </div>
					</form>
			</div>
		</div>)
  }