export default function employee(state = [],action) {
    switch(action.type) {
        case 'SET_EMPLOYEE_ON_SKIP': return action.payload;
        case 'SKIP_IF_ONE_EMPLOYEE': return action.payload.id;
        case 'SET_EMPLOYEE': return typeof action.payload == 'object' ?  [...state, ...action.payload] : [action.payload];
        case 'REMOVE_EMPLOYEE': return typeof action.payload == 'undefined' ? [] : state.filter(el => typeof action.payload != 'object' ? el != action.payload : action.payload.indexOf(el) < 0 );
        default: return state;
    }
}