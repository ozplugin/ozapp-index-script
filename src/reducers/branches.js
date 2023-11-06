export default function branches(state = [],action) {
    switch(action.type) {
        case 'SET_BRANCHES': return action.payload;
        default: return state;
    }
}