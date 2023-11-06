import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Cat from '../modules/Cat'


export default function Cats() {
  const services_cats = useSelector(state => state.services_cats);
  const step = useSelector(state => state.step)
  const active = step.current == 'services_cats'  ? ' active' : '';
  const dispatch = useDispatch();

  useEffect(() => {
    if (step.active != step.current && step.active == 'services_cats') {
      dispatch({type:'LOADED'})
      dispatch({
      type: 'SET_CURRENT_STEP',
      payload: 'services_cats'
    }) 
    }
  }, [step.active])

  return (<div className={`oz_services_cats${active}`}>{services_cats.map(cat => <Cat cat={cat}/>)}</div>)
  }