import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Timer from '../modules/Timer'




export default function AppointmentInfo() {
    const app = useSelector(state => state.app)
    const [AddToGoogleLink, setAddToGoogleLink] = useState('');
    const [FinalMessage, setFinalMessage] = useState('');
    let url = null
    const redirect = () => {
      if (url)
      window.location.href= url;
    }
    
    let redirectText = null
    if (app && app.response && Object.keys(app.response).filter(el => ['paypal_url', 'yandex_url', 'stripe_id'].indexOf(el) > -1).length) {
      redirectText = oz_lang.r1.split('%s');
      if (redirectText.length == 4) {
        redirectText = redirectText.map((el,i) => {
            if (i == 1) {
              let onEnd = redirect
              if (app.response.stripe_id) {
                  onEnd = () => {redirectToStripe(app.response.stripe_id)}
              }
              el = <>{' '}<b><Timer time={5} onEnd={onEnd} /></b>{' '} {el}</>
            }
            else if (i == 2) {
              let onClick = null
              if (app.response.stripe_id) {
                onClick = () => {redirectToStripe(app.response.stripe_id)}
              } 
              el = <a onClick={onClick} href={url}>{el}</a>
            }
            return el;
        })
      }
    } 

    useEffect(() => {
      if (app.response && app.response.appointment && app.response.appointment.ID) {
      let link = 'https://calendar.google.com/calendar/render?'
      let ap = app.response.appointment
      let start = moment.utc(ap.start).format("YYYYMMDDTHHmmss")+'Z'
      let end = ap.end ? moment.utc(ap.end).format("YYYYMMDDTHHmmss")+'Z' : start
      let text = ap.services.found ? ap.services.list.map(ser => ser.title).join(', ') : 'ID: '+ap.ID
      let params = {
        action: 'TEMPLATE',
        text,
        dates: start+'/'+end,
        details: app.response.finalMessage,
      }
        setAddToGoogleLink(link+Object.entries(params).map(el => el[0]+'='+el[1]).join('&'))
      }

      if (app.response && app.response.finalMessage) {
        setFinalMessage(app.response.finalMessage)
      }
    }, [app])
    
    return <>
            <Timer time={2} onEnd={() => oz_vars.redirect_url ?  window.location.href= oz_vars.redirect_url : false} show={false} />
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg> 
            <p className="oz_check">{oz_lang.str1}</p>
            <p>{redirectText}</p>
            <div className="oz_finalBlock">
              {FinalMessage &&
              <div class="oz_finalMessage">
                <div dangerouslySetInnerHTML={{__html: FinalMessage}} />
              </div>
              }
              <div className="oz_btn-group">
                {(oz_vars.canPrint && (app.response && app.response.uniqid)) && <a target="_blank" className="oz_btn oz_btn-small" href={`${window.location.href}?oz_print_appointment=${app.response.uniqid}`} >{oz_lang.print}</a>}
                <a className="oz_btn oz_btn-small" target="_blank" href={AddToGoogleLink}>+{oz_lang.gcal}</a>
                {(app.response && app.response.uniqid) && <a className="oz_btn oz_btn-small" href={`${window.location.href}?ics=oz_ics&id=${app.response.uniqid}`}>+{oz_lang.ical}</a>}
              </div>
            </div>
            </>
}