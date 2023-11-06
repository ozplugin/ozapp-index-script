import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useWindowSize from '../hooks/useWindowSize'

import {getCookie} from '../functions/functions'

import Step from '../components/steps/index';

import Popup from '../components/modules/Popup'
import Loader from '../components/modules/Loader'

import '../styles/App.scss';

export default function App(props) {
  const config = props.config
  const step = useSelector(state => state.step)
  const app = useSelector(state => state.app)
  const isActive = step.active;
  const loading = useSelector(state => state.loading);
  const services = useSelector(state => state.services);
  const service = useSelector(state => state.service);
  const isLoading = loading ? ' oz_load' : ''; 
  const steps = useSelector(state => state.steps);
  const dispatch = useDispatch();
  const popup = useSelector(state => state.popup)
  const showPopup = Object.keys(popup).length > 0;
  const [PopupMode, setPopupMode] = useState(false);
  const size = useWindowSize(PopupMode);
  let adaptiveSize = '';
  let width = size.width
	if (width < 992 && width > 767) {
    adaptiveSize = 'oz_width_xl_tablet'
    }
    else if (width < 768 && width > 481) {
      adaptiveSize = 'oz_width_tablet'
    }
    else if ( width < 481) {
      adaptiveSize = 'oz_width_mob'
    }
    else {
      adaptiveSize = ''
    }

  let prev = step.active ?  steps.indexOf(step.active) * 14.2857 : 0
  const x = step.current ? steps.indexOf(step.current) * 14.2857 : prev;
  const isRtl = oz_vars.rtl
  const translate = { 
    transform: `translateX(${isRtl ? '' : '-'}${x}%)`,
    //height: "100px"
};

const openPopup = (e) => {
  document.getElementById('oz_overlay').style.display = 'block'
  setTimeout(function() {
    document.querySelector('.oz_popup').style.display = 'block'
  },50);
  setTimeout(function() {
    document.querySelector('.oz_popup').classList.add('open')
    setPopupMode(true)
  },200);
}

const isInside = (innerelem) => {
  if (innerelem.tagName == 'SPAN' && 
  innerelem.className.indexOf('close') > -1 &&
  innerelem.parentElement.tagName == 'DIV' && innerelem.parentElement.className.indexOf('oz_popup') > -1)
  return false;

  return (
    document.getElementById('oz_overlay') != innerelem && 
    document.querySelector('#oz_overlay .oz_popup').hasChildNodes(innerelem)
  )
}

const closePopup = (e) => {
  if( isInside(e.target) ) 
  return;
  setPopupMode(false)
  document.querySelector('.oz_popup').classList.remove('open');
  setTimeout(function() {
    document.querySelector('.oz_popup').style.display = 'none'
    document.getElementById('oz_overlay').style.display = 'none'
  },250);
}

// кнопка для всплывающего окна
useEffect(() => {
  if (document.getElementById('oz_overlay')) {
    document.querySelector('.oz_pop_btn').addEventListener('click', openPopup)
    document.querySelector('#oz_overlay .close').addEventListener('click', closePopup)
    document.getElementById('oz_overlay').addEventListener('click', closePopup)
    return () => {
      document.querySelector('.oz_pop_btn').removeEventListener('click', openPopup)
      document.querySelector('#oz_overlay .close').removeEventListener('click', closePopup)
      document.getElementById('oz_overlay').removeEventListener('click', closePopup)
    }
  }
}, [])

// скролл к началу экрана
useEffect(() => {
  if (oz_vars.scrollToTop && !step.reverse)
  window.scrollTo({
    top: document.getElementById('oz_appointment').getBoundingClientRect().top + window.scrollY,
    behavior: "smooth"
});
}, [step.current])


  // if logged in
  useEffect(() => {
      if (oz_vars.user) {
      dispatch({
          type: 'SET_SUMMARY',
          payload: {
              oz_user_id : oz_vars.user.id,
              clientName : oz_vars.user.name,
              clientEmail : oz_vars.user.email 
          }
        }) 

        oz_vars.fields.forEach((el,i) => {
          if (oz_vars.user.name && el.meta == 'clientName') {
            oz_vars.fields[i].value = oz_vars.user.name
          }
          if (oz_vars.user.email && el.meta == 'clientEmail') {
            oz_vars.fields[i].value = oz_vars.user.email
          }
          })
      }  
  }, [])

  
  const back = useCallback(() => { 
    let back = steps.indexOf(isActive)
    if (typeof steps[back-1] != 'undefined') {
      dispatch({
        type: 'SET_STEP',
        payload: {
          active: steps[back-1],
          current: steps[back-1],
          prev: isActive,
          reverse: true
          }
      })

      // возвращаем шаги если они были пропущены
      if (steps.indexOf('employees') < 0 && app.employee_restore !== false && app.employee_restore == steps.indexOf(steps[back-1]) ) {
          let newsteps = steps.reduce((arr,el, ind) => {
            arr.push(el) 
            if (ind == app.employee_restore)
            arr.push('employees')
            return arr;
            },[])
          setTimeout(() => {
            dispatch({
              type: 'SET_STEPS',
              payload: newsteps
            })
            if (!oz_vars.employee_page) {
              dispatch({
                type: 'REMOVE_FILTER',
                payload: 'employees'
              }) 
            } 
          }, oz_vars.animation)
        }
        else if (steps.indexOf('services') < 0 && app.service_restore !== false && app.service_restore == steps.indexOf(steps[back-1]) ) {
          let newsteps = steps.reduce((arr,el, ind) => {
            arr.push(el) 
            if (ind == app.service_restore)
            arr.push('services')
            return arr;
            },[])
          setTimeout(() => {
            dispatch({
              type: 'SET_STEPS',
              payload: newsteps
            }) 
            dispatch({
              type: 'REMOVE_FILTER',
              payload: 'services'
            }) 
          }, oz_vars.animation)
        }
      }    
    })
    const hideBack = steps.indexOf(isActive) == 0 || !isActive || app.block_back  ? ' fadeOutTop' : ''

  useEffect(() => {
    let recur = services.filter(serv => service.indexOf(serv.id) > -1 && serv.recurring).length
    if (recur && steps.indexOf('recurring') < 0) {
      let st = steps.reduce((acc,cur,ind,arr) => {if ((arr.length - ind) == 1)acc.push('recurring'); acc.push(cur); return acc;},[])
      dispatch({
        type: 'SET_STEPS',
        payload: st
      })  
    }
    else if (!recur && steps.indexOf('recurring') > -1) {
      let st = steps.filter(s => s != 'recurring')
      dispatch({
        type: 'SET_STEPS',
        payload: st
      }) 
    } 
  }, [service])

  useEffect(() => {
    if (step.reverse) {
      // если есть фильтр по услуге, то нужна задержка при переключении шага
      //let to = step.prev == 'employees'  ? oz_vars.animation : 0
      dispatch({
        type: 'REMOVE_FILTER',
        payload: step.prev
      }) 
      // if (steps.indexOf(step.active) == 0) {
      //   dispatch({
      //     type: 'REMOVE_ALL_FILTERS',
      //   }) 
      // }
    }
  }, [step.active])

  useEffect(() => {
    if (step.active) {
      var event= new CustomEvent('onStepChange',{detail:{step}});
      document.addEventListener('onStepChange',function(){},false);
      document.dispatchEvent(event);
    }
  }, [step.active])

  useEffect(() => {
      dispatch({
        type: 'SET_STEPS',
        payload: config.steps
      })
      dispatch({
        type: 'SET_ACTIVE_STEP',
        payload: config.steps[0]
      })

  }, [])

  useEffect(() => {
    if (oz_vars.timezone_detect && 
      oz_app.ctz() != oz_app.tz() && 
      (!getCookie('oz_timezone') || (getCookie('oz_timezone') != 'no' && (oz_app.tz() != getCookie('oz_timezone') || getCookie('oz_site_tz') != oz_app.ctz()) ) )) {
        let site_timezone = oz_vars.timezone_string
      let str = oz_lang.tzmsg
        str = str.replace('%s', site_timezone)
     // oz_app.DialogInfo(str, oz_app.setUserTimezone, true)      
      dispatch({
        type: 'SET_POPUP',
        payload: {
          text: str,
          buttons: [
            {
              name: oz_lang.yes,
              action: oz_app.setUserTimezone,
            },
            {
              name: oz_lang.no,
              action: oz_app.setUserTimezone.bind(null,true),
            }
          ]
        }
      })
    }

  }, [])

  return (
    <div className={`oz_container${isLoading} ${adaptiveSize} container-${oz_vars.theme}`}>
      <div className="text-center">
      {!app.completed && <div onClick={back} class={`oz_back_btn${hideBack}`}>{oz_lang.r23}</div> }
      {typeof oz_vars.stepsnames[step.current] != 'undefined' && <h3 class="stepname">{oz_vars.stepsnames[step.current]}</h3>}
      </div>
      <div className={`oz_hid ${oz_vars.theme}`}>
        <div className="oz_hid_carousel" style={translate}>
          {steps.map((step, i) => <Step isActive={step == isActive} name={step} />)}
        </div>
      </div>
      {showPopup && <Popup />}
      {loading && <Loader />}
      {/* {oz_vars.debug && <AppSummary /> */}
    </div>
  );
}