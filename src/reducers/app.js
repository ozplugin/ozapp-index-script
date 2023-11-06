export default function app(state = {"updatePrices" : false},action) {
    //console.groupCollapsed(action.type);
    //console.trace(action.type, action.payload)
    //console.groupEnd();
    switch(action.type) {
        case 'SET_APP': return {...state, ...action.payload};
        case 'REMOVE_APP': 
        let newState = {}
        for (let key in state) {
            if (action.payload.indexOf(key) < 0) {
                newState[key] = state[key]
            }
        }
        return newState;
        case 'SET_EMPLOYEE_ON_SKIP': return {...state, skip_employee: true};
        case 'SET_STEPS': return {...state, employee_restore: false, service_restore: false};
        case 'SKIP_IF_ONE_EMPLOYEE': return {...state, employee_restore: action.payload.employee_restore};
        case 'SKIP_IF_ONE_SERVICE': return {...state, service_restore: action.payload.service_restore};
        case 'SET_EMPLOYEE':  return {...state, skip_employee: false};
        case 'SET_QUICKTIME':  return {...state, quick_time: action.payload.quick_time, q_date: action.payload.date, q_time: action.payload.time};
        case 'IPLOADED':  return {...state, IPloaded: action.payload};
        case 'UPDATE_PRICES':  return {...state, updatePrices: !state.updatePrices};
        case 'SET_SUM':  return state.updatePrices ? {...state, updatePrices: !state.updatePrices} : state;
        case 'SET_DISCOUNT':  return {...state, old_price : action.payload.old, block_back: true };
        //case 'REMOVE_SUMMARY': return action.payload == 'oz_personal_field_id' ? {...state, skip_employee: false} :  state;
        case 'APPOINTEMNT_COMPLETED' : return {...state, completed: true, response: action.payload};
        default: return state;
    }
}