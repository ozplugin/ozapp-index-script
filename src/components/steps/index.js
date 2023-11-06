import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import Services from '../steps/Services'
import Branches from '../steps/Branches'
import Employees from '../steps/Employees'
import Form from '../steps/Form'
import Cats from '../steps/Cats'
import Date from '../steps/Date'
import Time from '../steps/Time'




export default function Step(props) {
    const dispatch = useDispatch();
    const active = props.isActive ? 'active' : '';
    const setActive = useCallback(() => { dispatch({
              type: 'SET_ACTIVE_STEP',
              payload: props.name
            })  })
    switch(props.name) {
        case 'date' : return <Date/>
        case 'time' : return <Time/>
        case 'services_cats' : return <Cats/>
        case 'branches' : return <Branches/>
        case 'employees' : return <Employees/>
        case 'services' : return <Services/>
        case 'form' : return <Form/>
        default: return <div className={active} onClick={setActive}>{props.name}</div>;
    }
  }