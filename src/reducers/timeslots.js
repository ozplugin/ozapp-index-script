export default function timeslots(state = {},action) {
    switch(action.type) {
        case 'SET_TIME_SLOTS':  return {...state, ...action.payload};
        default: return state;
    }
}