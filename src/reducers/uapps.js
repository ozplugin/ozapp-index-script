export default function uapps(state = {},action) {
    switch(action.type) {
        case 'SET_UAPPS': return action.payload     
        default: return state;
    }
}