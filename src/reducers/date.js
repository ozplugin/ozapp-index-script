export default function date(state = '',action) {
    switch(action.type) {
        case 'SET_DATE':  return action.payload;
        default: return state;
    }
}