export default function loading(state = true,action) {
    //console.trace('action: ', action.type)
    switch(action.type) {
        case 'LOADING': return true;
        case 'SKIP_IF_ONE_EMPLOYEE': return true;
        case 'SKIP_IF_ONE_SERVICE': return true;
        case 'LOADED': return false;
        default: return state;
    }
}