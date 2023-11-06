import store from "../store";

function getCookie(name) {
		  let matches = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		  ));
		  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function TimeFormatted(time) {
	if (typeof oz_app == 'undefined') return time;
    if (!oz_app.u_tz()) {
      time = moment(time+' '+oz_app.ctzt(), 'HH:mm Z').clone()
    }
    else {
      time = moment(time, 'HH:mm')
    }
    time = oz_vars.AMPM ? time.format('hh:mm a') : time.format('HH:mm')	
  return time;
}

function DateVisual(date, time = store.getState().time.time, format = 'YYYY-MM-DD') {
	if (!oz_app.u_tz()) {
		date = moment(date+' '+time+' '+oz_app.ctzt(), format+' HH:mm Z', oz_vars.lang.split('_')[0])
	}
	else {
		date = moment(date, format, oz_vars.lang.split('_')[0])
	} 			
return date.locale(oz_vars.lang.split('_')[0]).format(oz_vars.dateFormat)
}

function addAttrsFromShortcode(params) {
	let filter = store.getState().filter
	if (oz_vars.atts && Object.keys(oz_vars.atts).length) {
		let atts = oz_vars.atts
		if (filter.service.services && filter.service.services.length) {
			atts = {}
			for (let k in oz_vars.atts) {
			  if (k != 'services') {
			  atts[k] = oz_vars.atts[k]
			  }
			}
		}
		if (Object.keys(atts).length > 0)
		params.set('query', JSON.stringify(atts))
	  }
}

async function loadEmployees() {
	let employees = store.getState().employees
	let steps = store.getState().steps
    let emps = []
    if (employees.length) return employees;
    let params = new URLSearchParams();
    store.dispatch({type:'LOADING'})
    params.set('action', 'oz_get_employees')
    params.set('type', 'all')
	addAttrsFromShortcode(params)
    const result = await (await fetch(
      oz_vars.oz_ajax_url, {
        method: 'post',
        body: params
      }
    )).json();
    store.dispatch({type: 'LOADED'})
    if (result.success) {
      if (result.payload.type == 'all' && typeof result.payload.result.branches != 'undefined') {
        // филиалы
        store.dispatch({
          type: 'SET_LOADED',
          payload: 'branches',
        })
        let newstepsIndex = steps.indexOf('employees')
        if (newstepsIndex > 0) {
        let newsteps = steps
        newsteps.splice(newstepsIndex,1, 'branches', 'employees')
          store.dispatch({
            type: 'SET_STEPS',
            payload: newsteps
          })
          store.dispatch({
            type: 'SET_BRANCHES',
            payload: typeof result.payload.result.branches.list != 'undefined' ? result.payload.result.branches.list : []
          })

        }
      }

      emps = result.payload.type == 'employees' ? result.payload.result.list : result.payload.result.employees.list
      // сотрудники
      store.dispatch({
        type: 'SET_LOADED',
        payload: 'employees',
      })

        store.dispatch({
          type: 'SET_EMPLOYEES',
          payload: emps
        })

     
    }
    return emps;
  }



export {getCookie, TimeFormatted, DateVisual, addAttrsFromShortcode, loadEmployees}