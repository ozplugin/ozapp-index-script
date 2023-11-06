import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import submitForm from '../../functions/submitForm'


export default function Popup() {
    const popup = useSelector(state => state.popup)
    const [popupText, setPopupText] = useState(popup.text)
    const [timer, setTime] = useState(0)
    const [externalWindow, setExternalWindow] = useState(null)
    const maxTime = 160 // 160 раз проверяет платеж (15 минут), если не пришел, закрывает окно
    const dispatch = useDispatch();
    const close = () => {
        dispatch({type: 'CLOSE_POPUP'})
        if (externalWindow)
        externalWindow.close()
    }

    const fetchData = async (action) => {
        let body = new URLSearchParams();
        Object.entries(action).forEach(a => body.set(a[0], a[1]))
        let res = await (await fetch(oz_vars.oz_ajax_url, {
            body,
            method:'post',
        })).json()
        if (res && res.pending) {
            let t = timer + 1
            setTime(t);
        }
        else if (res && res.error === false) {
            if (externalWindow)
            externalWindow.close()
            if (action.id) {
                dispatch({
                    type: 'SET_SUMMARY',
                    payload: {
                        pending_id : action.id
                    }
                })
            }
            dispatch({type: 'CLOSE_POPUP'})
            let answer = res?.payload || false
            submitForm(answer)
        }
    }

    // работа с всплывающим окном
    useEffect(() => {
        if (popup.action) {
        let st = setTimeout(() => {
            if (timer >= maxTime) {
                clearTimeout(st)
                dispatch({
                    type: 'SET_POPUP',
                    payload: {
                        text: oz_lang.r6
                     }
                })
                setTimeout(() => {
                    if (externalWindow) externalWindow.close()
                    close()
                }, 2000)
            }
            else {
                fetchData(popup.action)
            }
        }, 5000)
        return () => { clearTimeout(st) };
        }
    }, [timer])

    const openIframe = (url) => {
        if (externalWindow)
        externalWindow.focus()
        else {
            let win = window.open(url, '', 'width=700,height=500,left=200,top=100')
            setExternalWindow(win)
            setPopupText(oz_lang.wfp)
        }
    }

    const handleClick = (action, e, rest = {}) => {
        if (typeof action == 'function') {
            action()
        }
        else if (typeof action == 'string') {
            switch(action) {
                case 'close':
                    close();
                break;
                case 'iframe':
                    openIframe(rest.url);
                break;
            }
        }

    }
    
    useEffect(() => {
        window.scrollTo({
            top: document.getElementById('oz_appointment').getBoundingClientRect().top + window.scrollY,
            behavior: "smooth"
        })
    },[])

    return <div className="oz_dialog_info">
                <div style={{alignItems: 'flex-start'}} className="oz_dialog_wrap oz_flex oz_h-100">
                    <div className="oz_dialog_info_win">
                        <span>{popupText}</span>
                        { (popup.buttons && popup.buttons.length > 0) &&
                            popup.buttons.map((button, i) => {
                                let margin = i > 0 ? 10 : 0
                                return <div onClick={(e) => {handleClick(button.action, e, button)}} style={{marginLeft:margin}} className="oz_btn">{button.name}</div>
                            })
                        }
                    </div>
                </div>
            </div>
}