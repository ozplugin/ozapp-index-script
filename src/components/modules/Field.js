import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import ReCAPTCHA from "react-google-recaptcha";
import Timer from '../modules/Timer'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomFieldFile = (props) => {
	const field = props.field
	const [Value, setValue] = useState([])
	const [Uploading, setUploading] = useState(false)
	const fileRef = useRef(null);

	const uploadFile = async (file) => {
		let files = file.target.files
        if (document.body.classList.contains('loading')) {
            return;
        }
        document.body.classList.add('loading')
		setUploading(true)
        let form_data = new FormData();
		[...files].map(f => {
			form_data.append('file[]', f)
			form_data.append('name[]', f.name)
		})
        form_data.append('action', 'oz_upload_custom_file')
        form_data.append('meta', field.meta)
        form_data.append('_wpnonce', oz_vars.nonce)
        try {
            const res = await (await fetch(oz_vars.oz_ajax_url, {
              method: 'POST',
              body: form_data
            })).json();
            if (res) {
                if (res.success) {
					let value = res.payload
					props.onChange(value)
					setValue(value.split(','))
                }
                else {
                    alert(res.payload);
                }
            }
          } catch (error) {
            alert('Error!', error);
          }
		  setUploading(false)
          document.body.classList.remove('loading')
    }

	const removeLine = async (val) => {
		document.body.classList.add('loading')
		setUploading(true)
        let form_data = new URLSearchParams();
        form_data.set('action', 'oz_remove_custom_file')
        form_data.set('file', val)
        form_data.set('_wpnonce', oz_vars.nonce)
        try {
            const res = await (await fetch(oz_vars.oz_ajax_url, {
              method: 'POST',
              body: form_data
            })).json();
            if (res) {
                if (res.success) {
					let newVal = Value.filter(el => el != val)
					try {
					props.onChange(newVal.join(','))
					}
					catch(er) {
						console.log(er)
					}
					setValue(newVal)
                }
                else {
                    alert(res.payload);
                }
            }
          } catch (error) {
            alert('Error!', error);
          }
		  setUploading(false)
          document.body.classList.remove('loading')
	}
						

	return <>
        <label class={`field-${field.meta} oz_input-label oz_label-file`} for={field.meta}>
        	{field.name}
	{Value.length > 0 ? 
	<div>
        {Value.map(el => {
		let name = el.split('/').slice(-1);
		return <div class="oz_flex oz_uploaded_file"><a class="oz_uploaded_link" target="_blank" href={el}>{name}</a> <div className="oz_close" onClick={() => {removeLine(el)}} ><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#000'><path d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/></svg></div></div>
		})}
	</div> 
	:
            <input ref={fileRef} onChange={uploadFile} type="file" class={props.classes.join(' ')} name={field.meta} multiple /> 
		}
        {Uploading && <div class="oz_loading"></div>}
    </label>
	</>
}

const CustomFieldDate = (props) => {
	const [Value, setValue] = useState()
	const setDate = (date) => {
		setValue(date)
		date = moment(date).format('YYYY-MM-DD')
		props.onChange(date)
	}

	return <label class={`field-${props.field.meta} oz_input-label`}>
        <DatePicker selected={Value} className={`form-control ${props.classes.join(' ')}`} dateFormat={oz_vars.dateFormatLuxon} placeholderText={props.field.name} onChange={setDate} />
        </label>
}


export default function Field(props) {
    const field = props.field;
    const recaptchaRef = useRef(null);
    const telRef = useRef(null);
    const step = useSelector(state => state.step);
    const summary = useSelector(state => state.app_summary);
    const block_back = useSelector(state => state.app.block_back);
    let def_services = useSelector(state => state.services);
    const deposits = useSelector(state => state.app_summary.oz_use_deposit)
    let services = []
    if (summary.oz_uslug_set)
        services = def_services.filter(serv => summary.oz_uslug_set.indexOf(serv.id) > -1)
    const updatePricesonRecur = summary.recurring
    let sum = services.reduce((sm,ser) => {
        let price = deposits && deposits.indexOf(ser.id) > -1 ? ser.deposit.value : ser.price
        return sm+price
    },0);
    if (updatePricesonRecur && updatePricesonRecur.length) {
        let recur = oz_app.get('recurring')
        if (recur.params.pay == 'all')
        sum = sum * (recur.generated.length +1)
    }
    const [placeholder, handlePlaceholder] = useState(false)
    const [phoneCountry, setPhoneCountry] = useState({})
    const form_fields = useSelector(state => state.form_fields)
    const dispatch = useDispatch();
    let classes = field.classes
    if (form_fields.checking && form_fields.not_valid.indexOf(field.meta) > -1) {
        if (classes.indexOf('req') < 0) classes.push('req')
    }
    else {
        classes = classes.filter(el => el != 'req')
    }

    const [add_params, setInputParams] = useState({})
    const [input_value, setInputValue] = useState(field.value)
    const phonecountryonLoad = useSelector(state => state.app.IPloaded)

    /**
     * check if oz_vars.payment_rules exist and remove payment method by condition (chosen services)
     * @param {object} val select options
     * @returns object
     */
    const checkForRules = (val) => {
        if (oz_vars.payment_rules) {
            oz_vars.payment_rules.forEach(rule => {
                switch(rule.rule) {
                    case 'services' :
                        let vals = summary?.oz_uslug_set
                        if (vals) {
                        rule.method.forEach(method => {
                            let fil = rule.value.filter(el => vals.indexOf(parseInt(el)) > -1)
                            if (fil.length) {
                                    if (rule.type == 'exclude') {
                                    val = val.filter(el => el.indexOf(method) < 0)
                                    }
                                }
                                else {

                                }
                            })
                        }
                    break;
                }
            })
        }
        return val
    }

    const validate = (value = false) => {
        let not_valid = false
        let check = value === false ? (typeof summary[field.meta] == 'undefined' ? '' : summary[field.meta] ) : value
        let required = field.validation.indexOf('empty') > -1
        field.validation.forEach(el => {
            switch(el) {
                case 'empty':
                    not_valid = not_valid ? not_valid : !check
                break;
                case 'tel':
                    if (required) {
                        let tel_valid = true
                        if (phoneCountry && phoneCountry.format || telRef?.current && telRef?.current.getCountryData()) {
                            let phCo = phoneCountry?.format ? phoneCountry : telRef?.current.getCountryData()
                            tel_valid = phCo.format.match(/\./g).length == value.length - 1 // -1 это убираем + из номера
                        }
                        not_valid = not_valid ? not_valid : !tel_valid
                    }
                break;
                case 'email':
                    if (required) {
                        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        let email = check
                        not_valid = not_valid ? not_valid : !re.test(String(email).toLowerCase())
                    }
                break;
                case 'recaptcha' :
                    not_valid = not_valid ? not_valid : !recaptchaRef.current.getValue()
                break;
            }
        })
        let action_valid = not_valid ? 'SET_FIELD_ERROR' : 'REMOVE_FIELD_ERROR'
        dispatch({
            type: action_valid,
            payload: field.meta
        })
    }


    const handleOnChange = (value, country) => {
        try {
            if (country && country.countryCode != phoneCountry.countryCode) {
                        setPhoneCountry(country)
            }
        }
        catch(e) {
            console.log(e)
        } 
        if (value && value.length) value = '+'+value
        handleSummary(value)
        if (country && placeholder) {
            handlePlaceholder('')   
        }
        if (field.name && field.name.country && field.name.country == country.countryCode ) {
            if (field.name.placeholder != placeholder)
            handlePlaceholder(field.name.placeholder)  
        }
    }

    const handleSummary = (value, e = false) => {
        let name = field.meta
        setInputValue(value)
        if (e) {
            e.target.value = value
            if (field.type == 'checkbox') {
                value = e.target.checked ? value : ''
                name = e.target.name
            }
        }
        validate(value)
        let payload = {}
        payload[name] = value
        dispatch({
            type: 'SET_SUMMARY',
            payload
          }) 
    }

    const submit_coupon = async (e) => {
        if (summary.oz_coupon_code) {
            dispatch({type: 'LOADING'})
            let body =  new URLSearchParams()
            let params = {
                action: 'oz_promocodes',
                code: summary.oz_coupon_code,
                services: summary.oz_uslug_set,
                personal: summary.oz_personal_field_id,
                sum,
                deposits
            }
                Object.entries(params).forEach(param => {body.set(param[0], param[1])})
            let res = await (await fetch(oz_vars.oz_ajax_url,{
                method: 'post',
                body
                }
            )).json()
            dispatch({type: 'LOADED'})
            if (res.valid) {
                dispatch({
                    type: 'SET_DISCOUNT',
                    payload: {
                      'new' :  res.sum,
                      'old' :  sum
                    }
                  }) 
                setInputParams((state) => {return {...state, 
                    classes:['oz_valid'],
                    inputParams: {
                        readOnly: true,
                    }
                };})
            }
            else {
                setInputParams((state) => {return {...state, classes:['req']};})
                setTimeout(() => {
                    setInputParams((state) => {return {...state, classes:[]};})
                },2000)  
            }
        }
        else {
            setInputParams((state) => {return {...state, classes:['req']};})
            setTimeout(() => {
                setInputParams((state) => {return {...state, classes:[]};})
            },2000)
            console.log('empty code')
        }
    }

    const handleRecaptcha = async (value) => {
        if (value) {
            dispatch({
                type: 'REMOVE_FIELD_ERROR',
                payload: 'recaptcha'
            })
        }
    }

    const recaptchaExpired = () => {
            dispatch({
                type: 'SET_FIELD_ERROR',
                payload: 'recaptcha'
            })       
    }

    const removeOTPField = () => {
        dispatch({
            type: 'REMOVE_SUMMARY',
            payload: 'oz_otp_code'
        })         
    }

    const handleInputAction = (action,e) => {
        switch(action) {
            case 'submit_coupon':
                submit_coupon(e)
            break; 
        }
    }

    useEffect(() => {
        if (field.type == 'select') {
            let v = field.values ? field.values.split('\n') : []
            if (field.meta == 'oz_payment_method') {
                v = checkForRules(v)
            }
            if (v.length) {
                handleSummary(field.value || v[0])
            }
        }
        if (field.required && field.type != 'select') {
        validate()
        }
        if (field.type == 'tel') {
            if (!phonecountryonLoad) {
                let cou = typeof field.name.countries == 'string' ? field.name.countries.split(',') : field.name.countries
                let ifOneCountry = cou.filter(el => el != false)
                // если только одна страна в списке
                if (ifOneCountry.length == 1) {
                    dispatch({type:'IPLOADED', payload: ifOneCountry[0]})
                }
                else {
                    (async () => {
                        try {
                            let ip_url = oz_vars.ipInfoToken ? 'https://ipinfo.io/?token='+oz_vars.ipinfotoken : 'https://ipinfo.io/'
                            let ip = await (await fetch(ip_url, {
                                headers: {
                                    'Content-Type': 'application/json', 
                                    'Accept': 'application/json'
                                    },
                            })).json()
                            if (ip.country) {
                                dispatch({type:'IPLOADED', payload:ip.country.toLowerCase()})
                            }
                            else {
                                if (field.name.country)
                                dispatch({type:'IPLOADED', payload:field.name.country})
                            }
                        }
                        catch(err) {
                            console.log(err)
                        }
                    })()
                }
            }
            if (field.value)
            handleSummary(field.value)

            handlePlaceholder('')
        }
    }, [])

    useEffect(() => {
        if (step.active == step.current && step.active  == 'form') {
            if (field.type == 'select' && field.meta == 'oz_payment_method') {
                let v = field.values ? field.values.split('\n') : []
                    v = checkForRules(v)
                if (v.length) {
                    handleSummary(v[0])
                }
            }
        }

    }, [step]) 

    let defParams = {
        'type':"text",
        'onChange': (e) => { handleSummary(e.target.value)},
        'name': field.meta,
        'size': field.size, 
        'className': classes.join(' '),
        'ariaRequired': field.required,
        'placeholder': field.name,  
        'maxlength' : field.maxlength,
        'pattern' : field.pattern,
        'value' :  input_value
    }
    let template = <label className="oz_input-label" for={field.meta}>
                    <input {...defParams} />
                </label>;
    switch(field.type) {
        case 'input':
            if (!form_fields.otp && field.meta == 'oz_otp_code') {
                template = null
                break;
            }
            if (field.meta == 'oz_coupon_code' && !summary.oz_order_sum ) {
                template = null
                break;
            }
            if (field.additional && field.additional.length) {
                let classes = add_params.classes ? add_params.classes.join(' ') : ''
                let pars = {}
                if (add_params.inputParams) {
                    pars = add_params.inputParams
                }
                let svg = add_params.classes && add_params.classes.indexOf('oz_valid') > -1 ? <svg className="svgok" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><path class="svgok__ok" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>  : ''
                let hideBtn  = svg ? ' oz_hide' : ''
                const par = {...defParams, ...pars}

                template = <div className={`oz_book_flex oz_input_group oz_flex_wrap ${classes}`}>
                    {field.additional.map(par => par.type).indexOf('button') < 0 && <input {...par} />}
                    {field.additional.map(param => {
                        switch(param.type) {
                            case 'button':
                                return     <div className="oz_rel w-100">
                                                    <input {...par} />
                                                    <div onClick={(e) => {handleInputAction(param.action, e)}} className={`oz_abs_btn ${hideBtn}`}>{param.name}</div>
                                                    {svg}
                                            </div>
                             case 'info':
                                 return     <div class="oz_rel w-100">
                                                <small style={{whiteSpace: 'nowrap'}}>
                                                    <span>{param.text}</span>
                                                    { param.action == 'otp_code' &&
                                                    <>: <b className="oz_otp_timer"><Timer onEnd={() => {removeOTPField()}} time={300} /></b></>
                                                    }
                                                </small>
                                            </div>
                        }
                    })}
                </div>
                }
        break;
        case 'tel' :
            let countryPlaceholder = []
            let defMask = '... ... ...'
            let cou = typeof field.name.countries == 'string' ? field.name.countries.split(',') : field.name.countries
            let onlyCountries = cou.length ? cou.filter(el => el != false) : []
            if (field.name.country) {
                if (onlyCountries.length && onlyCountries.indexOf(field.name.country) < 0 ) {
                    onlyCountries.push(field.name.country)
                }
                countryPlaceholder[field.name.country] = field.name.placeholder
            }
            if (oz_vars.placeholders) {
                Object.keys(oz_vars.placeholders).map(el => {
                    countryPlaceholder[el] = oz_vars.placeholders[el]
                })
            }
            if (oz_vars.defaultMask) {
                defMask = oz_vars.defaultMask
            }
            if (!phonecountryonLoad) {
                // добавил такое условие, т.к. если его убрать дефолтное значение номера телефона не вставляется
                template = null
            }
            else {
            template = <label className="oz_input-label" for={field.meta}><PhoneInput
                        country={phonecountryonLoad}
                        onChange={handleOnChange}
                        onlyCountries={onlyCountries}
                        enableSearch={true}
                        name={field.meta}
                        inputClass={classes.join(' ')}
                        ref={telRef}
                        masks={countryPlaceholder}
                        defaultMask={defMask}
                        placeholder={oz_lang.r28}
                        value={input_value}
                        //countryCodeEditable={false}
                        />
                        </label>
            }
        break;

        case 'checkbox' :
            let val = ISPRO && field.values ? field.values.split('\n') : []
            const cls = classes
            template = <>
            <label className="oz_input-label" for={field.meta}>{field.name}</label>
            {val.map((checkbox, i) => {
                // проверить нормально ли добавляется произвольное поле чекбокс если только один выбор
                let meta = val.length > 1 ? `${field.meta}__${i}` : field.meta
                let name = typeof field.select_names != 'undefined' && typeof field.select_names[checkbox] != 'undefined' ? field.select_names[checkbox] : checkbox
                let cla = cls.map(cl => {cl = cl == 'field-'+field.meta ? cl+'-'+i : cl; return cl;}).join(' ')
                return <label className={`${cla} oz_cust_checkbox oz_input-label`} for={field.meta}>
                            <input 
                            type="checkbox" 
                            name={meta} value={checkbox}
                            onChange={(e) => { handleSummary(e.target.value, e)}}
                            /> 
                            {name}			
                    </label>
            })}
            </>
        break;

        case 'select' :
            val = field.values ? field.values.split('\n') : []
            if (field.meta == 'oz_payment_method') {
                val = checkForRules(val)
            }
            const [openThis, openDropDown] = useState(false)
            const handleDropDown = (val) => {
                if (field.meta == 'oz_payment_method' && block_back) return;
                openDropDown(!openThis)
                handleSummary(val)
            }
            let isOpen = openThis ? 'open' : ''
            if (field.meta == 'oz_payment_method' && !summary.oz_order_sum ) {
                template = null
            }
            else {
            template = (val.length) ? <>
            <label className="oz_input-label" for={field.meta}>{field.name}</label>
            <ul data-select={field.meta} className={`oz_select ${isOpen}`}>
				<li className="oz_li oz_li_sub">
					<ul>
                        {val.map((select, i) => {
                            let name = typeof field.select_names != 'undefined' && typeof field.select_names[select] != 'undefined' ? field.select_names[select] : select 
                            let isActive = i == 0 ? ' active' : ''
                                if (typeof summary[field.meta] != 'undefined') {
                                    isActive = summary[field.meta] == select ? ' active' : ''
                                }
                            return  <li data-value={select} onClick={() => {handleDropDown(select)}} class={`oz_li_sub_li${isActive}`}>{name}</li>
                        })}
					</ul>
				</li>
			</ul>
            </> : null
            }
        break;
        
        case 'textarea' :
            if (ISPRO) {
            template = <label className={`${classes.join(' ')} oz_cust_textarea oz_input-label`} for={field.meta}> 
                            <textarea 
                            name={field.meta}
                            placeholder={field.name}
                            onChange={(e) => { handleSummary(e.target.value)}}
                            className={classes.join(' ')}
                            ariaRequired={field.required}
                            />
                        </label>
            }
        break;

        case 'file' :
            if (ISPRO) {
            template = <CustomFieldFile field={field} classes={classes} onChange={handleSummary} />
            }
        break;

        case 'date' :
            if (ISPRO) {
            template = <CustomFieldDate field={field} classes={classes} onChange={handleSummary} />
            }
        break;

        case 'recaptcha' :
        if (ISPRO) {
            template = <div  className={`${classes.join(' ')} oz_book_flex oz_input_group oz_flex_wrap oz_flex-center oz_input-label`} for={field.meta}>
            <ReCAPTCHA
            sitekey={field.key}
            ref={recaptchaRef}
            // size='compact'
            onExpired={recaptchaExpired}
            onChange={handleRecaptcha}
            />
            </div>
        }
        break;
    }
    return template
}