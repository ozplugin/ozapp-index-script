export default function service(state = [],action) {
    switch(action.type) {
        case 'SET_SERVICE':  return oz_vars.multiservice ? [...state, action.payload] : [action.payload];
        case 'SKIP_IF_ONE_SERVICE': return action.payload.id;
        case 'REMOVE_SERVICE': return state.filter(el => typeof action.payload != 'object' ? el != action.payload : action.payload.indexOf(el) < 0 );
        default: return state;
    }
}