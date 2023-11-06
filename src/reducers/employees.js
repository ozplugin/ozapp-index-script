export default function employees(state = [],action) {
    switch(action.type) {
        case 'SET_EMPLOYEES': return action.payload;
        default: return state;
    }
}