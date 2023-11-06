export default function services(state = [],action) {
    switch(action.type) {
        case 'SET_SERVICES': return action.payload;
        default: return state;
    }
}