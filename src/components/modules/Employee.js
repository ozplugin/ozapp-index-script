import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCookie } from '../../functions/functions';





export default function Employee(props) {
    let employee = props.employee
    const withDescription = employee.description ? 'with-description' : ''
    let onRender = props.onRender
    let id = employee.id
    const Emp = useRef(null)
    let employeeSlots = typeof employee.slots != 'undefined' && Object.entries(employee.slots).length > 0 ? employee.slots : false
    const steps = useSelector(state => state.steps);
    const step = useSelector(state => state.step)
    const activeStep = step.active;
    const hasUrl = oz_vars.employee_link && employee.url;
    const dispatch = useDispatch();
    const [DescOpen, setDescOpen] = useState('')
    const setEmployee = useCallback((id, e, date = null, time = null, slots = null) => {
        if (e.target.classList.contains('oz_btn_link')) return;
        if (e.target.classList.contains('oz_quick_more')) return;
        if (e.target.classList.contains('oz_quick_time') && (!date && !time)) return;
        if (oz_vars.theme && oz_vars.theme.trim() == 'neumorph-theme' && e.target.classList.contains('with-description')) {
            let app = document.querySelector('.oz_employees')
            let cont_height = app.getBoundingClientRect().top + window.scrollY + app.getBoundingClientRect().height
            let title_top = e.target.getBoundingClientRect().top + window.scrollY + e.target.getBoundingClientRect().height + 40 // 40 это padding
            let isDesc = e.target.nextElementSibling.firstElementChild || e.target.nextElementSibling.nextElementSibling.firstElementChild
            if (isDesc) {
                isDesc.style.maxHeight = `${parseInt(cont_height - title_top)}px`
            }
            setDescOpen(state => { return !state ? 'oz_desc_open' : '' })
            return;
        }
        let payload = id
        dispatch({
            type: 'SET_EMPLOYEE',
            payload
        })

        dispatch({
            type: 'SET_FILTER',
            payload: {
                type: 'employee',
                step: 'employees',
                value: [payload]
            }
        })

        let mtime = false
        if (date != null && time != null) {
            slots.map((slot, i) => {
                if (slot[0] == time) {
                    let j = i + 1
                    while (typeof slots[j] != 'undefined') {
                        if (slots[j][1]) {
                            mtime = moment(slots[j][0], 'HH:mm').diff(moment(time, 'HH:mm'), 'minutes')
                            let Mtime = {}
                            Mtime[payload] = mtime
                            mtime = Mtime
                            break;
                        }
                        j++
                    }
                }
            })
        }


        dispatch({
            type: 'SET_MTIME',
            payload: mtime
        })


        dispatch({
            type: 'SET_QUICKTIME',
            payload: {
                quick_time: date != null && time != null,
                date, time
            }
        })


        let nextStep = steps.indexOf(activeStep)
        if (typeof steps[nextStep + 1] != 'undefined') {
            dispatch({ type: 'LOADING' })
            dispatch({
                type: 'SET_ACTIVE_STEP',
                payload: steps[nextStep + 1]
            })
        }
    })

    let updateTimezoneInSlots = (slots) => {
        if (Object.entries(slots).length < 1) return false;
        //console.log(slots)
        let sl = {}
        let ctztext = oz_app.ctzt()
        Object.entries(slots).map((slots, ind) => {
            let key = slots[0]
            if (ind > 5) {
                sl[key] = slots[1]
                return null
            }
            slots[1].map((slot, ind) => {
                let date = moment(slots[0] + ' ' + slot[0] + ' ' + ctztext, 'YYYY-MM-DD HH:mm Z')
                key = date.format('YYYY-MM-DD')
                if (typeof sl[key] != 'undefined') {
                    sl[key].push([slot[0], slot[1], date.format('HH:mm'), slots[0]])
                }
                else {
                    sl[key] = [];
                    sl[key].push([slot[0], slot[1], date.format('HH:mm'), slots[0]]);
                }
            })
        })
        return sl;
    }

    if (oz_vars.timezone_detect && getCookie('oz_timezone') != 'no') {
        employeeSlots = updateTimezoneInSlots(employeeSlots)
    }

    const showHides = (e) => {
        let el = e.target;
        [...el.parentElement.children].forEach(el => el.classList.remove('oz_hide'))
        el.remove()
    }

    useEffect(() => {
        if (typeof onRender == 'function') {
            window.addEventListener('resize', () => { onRender(Emp.current) })
            onRender(Emp.current)
            return () => { window.removeEventListener('resize', () => { onRender(Emp.current) }) }
        }
    }, [])
    return (
        <li ref={Emp} id={`oz_employee-${id}`} onClick={(e) => { setEmployee(id, e) }} class={`personal ${DescOpen}`}>
            <div class="oz_image">
                <div style={{ "backgroundImage": `url('${employee.img}')` }} class="oz_spec_back"></div>
                <img src={employee.img} alt="personal image" />
            </div>
            <div class="pers-content">
                <p class={`pname ${withDescription}`}>
                    {employee.title}
                </p>

                {(employee.reviews.show && oz_vars.employee_rating) &&
                <div class="pers-rating">
                    <div class="pers-stars-wrap">
                        <div class="pers-stars"></div>
                        <div class="pers-stars-scale" style={{ "width": Number(employee.reviews.score / 5 * 100).toFixed(2) + '%' }}></div>
                    </div>
                    <div class="pers-reviews">{`(${employee.reviews.number})`}</div>
                </div>
                }

                {employee.occupation &&
                    <p class="special">
                        {employee.occupation}
                    </p>
                }
                {oz_vars.theme && oz_vars.theme.trim() == 'default-theme' && <br />}
                {employee.description &&
                    <>
                        <div class="oz_text_cont"><div class="oz_text_cont_wrap" dangerouslySetInnerHTML={{ __html: employee.description }} /></div>
                    </>
                }
                <div class="oz_select_btn oz_btn">{oz_lang.r3}</div>
                {hasUrl &&
                    <a href={employee.url} class="oz_btn oz_btn_link">{oz_lang.r5}</a>
                }
                {employeeSlots &&
                    <div class="oz_quick_slots">
                        <div class="oz_quick_title">{oz_lang.closestslots}</div>
                        <div class="oz_quick_days">
                            {Object.entries(employeeSlots).map((slots, ind) => {
                                if (ind > 2) return null
                                let slots_filter = slots[1].filter(slot => !slot[1])
                                if (!slots_filter.length) return null
                                return (
                                    <div class="oz_quick_day">
                                        <p>{moment(slots[0], 'YYYY-MM-DD').format(oz_vars.dateFormat)}</p>
                                        <div class="oz_quick_times">{
                                            slots_filter.map((slot, i) => {
                                                let hide = i > 2 ? 'oz_hide' : '';
                                                let tpl = null
                                                let time = typeof slot[2] != 'undefined' ? slot[2] : slot[0]
                                                if (oz_vars.AMPM) {
                                                    time = moment(time, 'HH:mm').format('hh:mm a')
                                                }
                                                let day = typeof slot[3] != 'undefined' ? slot[3] : slots[0]
                                                tpl = <div onClick={(e) => { setEmployee(id, e, day, slot[0], slots[1]) }} class={`oz_quick_time ${hide}`}>{time}</div>
                                                if (i == 2 && slots_filter.length > i + 2) { // +2 because last slot is end of schedule
                                                    tpl = <>{tpl}<div onClick={showHides} class="oz_quick_more">{oz_lang.r5}</div></>
                                                }
                                                return tpl
                                            })
                                        }
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                }
            </div>
        </li>
    )
}