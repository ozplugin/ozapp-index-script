export default function cat(state = '',action) {
    switch(action.type) {
        case 'SET_CAT':  return action.payload;
        case 'REMOVE_CAT': return '';
        default: return state;
    }
}