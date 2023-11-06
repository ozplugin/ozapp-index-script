// function rootReducer(state, action) {
//     switch(action.type) {
//         case 'ACTION_1': return { value: action.value_1 };
//         case 'ACTION_2': return { value: action.value_2 };
        
//         default: return state;
//     }
// }

import { combineReducers } from 'redux'

import app from './app'
import app_summary from './app_summary'
import form_fields from './form_fields'
import popup from './popup'

import step from './step'
import steps from './steps'

import loading from './loading'

import uapps from './uapps'

import services_cats from './services_cats'
import cat from './cat'
import services from './services'
import service from './service'

import date from './date'
import timeslots from './timeslots'
import time from './time'

import branches from './branches'
import branch from './branch'
import employees from './employees'
import employee from './employee'
import filter from './filter'

function asyncElements(state = [],action) {
  switch(action.type) {
      case 'SET_LOADED': return [...state, action.payload];
      default: return state;
  }
}


export default combineReducers({
  loading,
  service,
  steps,
  step,
  services,
  employees,
  employee,
  asyncElements,
  services_cats,
  cat,
  date,
  timeslots,
  branches,
  branch,
  time,
  app_summary,
  filter,
  app,
  form_fields,
  popup,
  uapps
})