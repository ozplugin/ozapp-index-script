export default function form_fields(state = {'not_valid':[], 'checking': false, 'otp': 0},action) {
    switch(action.type) {
        case 'SET_FIELD_ERROR':        
        return state.not_valid.indexOf(action.payload) > -1 ? state : {...state, not_valid:[...state.not_valid, action.payload]};                   
        case 'REMOVE_FIELD_ERROR': 
        return {...state, not_valid:state.not_valid.filter(el => el != action.payload)}; 
        case 'CHECK_VALIDATY' : return {...state, checking: !state.checking}; 
        case 'SUBMIT_FORM' : return {...state, otp: state.otp+1};                 
        case 'REMOVE_SUMMARY' : return action.payload == 'oz_otp_code' ? {...state, otp: 0} : state;                 
        default: return state;
    }
}