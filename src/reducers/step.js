export default function step(state = {active: '', current: '', reverse: false},action) {
    switch(action.type) {
        case 'SET_ACTIVE_STEP': return typeof action.payload == 'string' ? {...state, active : action.payload , reverse:false} : {...state, active : action.payload['active'], reverse : action.payload['reverse']};
        case 'SKIP_IF_ONE_EMPLOYEE': return typeof action.payload.next != 'undefined' ? {...state, active : action.payload.next} : state;
        case 'SKIP_IF_ONE_SERVICE': return {...state, active : action.payload.next};
        case 'SET_CURRENT_STEP': return typeof action.payload == 'string' ? {...state, current : action.payload, reverse:false} : {...state, current : action.payload['current'], reverse : action.payload['reverse']};
        case 'NEXT_STEP': return {...state, current : action.payload, prev : null};
        case 'SET_STEP': return {...state, ...action.payload};
        default: return state;
    }
}