export default function popup(state = {},action) {
    switch(action.type) {
        case 'SET_POPUP': return action.payload
        case 'CLOSE_POPUP' : return {}               
        default: return state;
    }
}