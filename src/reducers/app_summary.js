export default function app_summary(state = {oz_use_deposit: []},action) {
    let serv = []
    switch(action.type) {
        case 'SET_SUMMARY': return {...state, ...action.payload};
        case 'REMOVE_SUMMARY':
        let st = {}
        for (let key in state) {
            if (key != action.payload) {
                st[key] = state[key]
            }
        }
        return st;

        case 'SET_EMPLOYEE': return {...state, oz_personal_field_id:action.payload};
        case 'SKIP_IF_ONE_EMPLOYEE': return {...state, oz_personal_field_id:action.payload.id};
        case 'SKIP_IF_ONE_SERVICE': return {...state, oz_uslug_set:action.payload.id};
        case 'REMOVE_EMPLOYEE': return {...state, oz_personal_field_id:''};

        case 'SET_SERVICE': serv = typeof state.oz_uslug_set != 'undefined' && state.oz_uslug_set.length ? state.oz_uslug_set : []  
                            return !oz_vars.multiservice ? {...state, oz_uslug_set: [action.payload]} :   {...state, oz_uslug_set:[...serv, action.payload]};
        case 'REMOVE_SERVICE': serv = typeof state.oz_uslug_set != 'undefined' ? state.oz_uslug_set : []
                               serv = serv.filter(el => typeof action.payload != 'object' ? el != action.payload : action.payload.indexOf(el) < 0 )
                            return {...state, oz_uslug_set:serv};

        case 'SET_RECURRING' : return {...state, recurring:action.payload};
        case 'REMOVE_RECURRING' : let st1 = Object.keys(state).reduce((acc, el) => {if (el != 'recurring') acc[el] = state[el]; return acc}, {}); 
                            return st1;

        case 'SET_DATE':  return {...state, oz_start_date_field_id:action.payload};                    
        case 'SET_TIME':  return {...state, oz_time_rot:action.payload.time};                    
        
        case 'SET_SUM':  
        let sum = Number.isInteger(action.payload) ? action.payload : Number(action.payload.toFixed(2))
        return {...state, oz_order_sum:sum};                    
        case 'SET_DISCOUNT':  return {...state, oz_order_sum:action.payload.new};                    
        
        case 'SET_DEPOSIT': return {...state, oz_use_deposit:[...state.oz_use_deposit, action.payload]};               
        case 'RESET_DEPOSIT': return {...state, oz_use_deposit:[]};               
        case 'REMOVE_DEPOSIT':  
        let oz_use_deposit = state.oz_use_deposit.filter(de => de != action.payload)
        return {...state, oz_use_deposit};                    
        default: return state;
    }
}