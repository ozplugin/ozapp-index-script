export default function branch(state = '',action) {
    switch(action.type) {
        case 'SET_BRANCH':  return action.payload;
        case 'REMOVE_BRANCH': return '';
        default: return state;
    }
}