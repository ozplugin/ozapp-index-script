export default function filter(state = {employee: {}, service: {}},action) {
    switch(action.type) {
        case 'SET_FILTER': 
        let employee = {}
        let service = {}
        if (action.payload.type == 'employee') {
            employee = state.employee
            employee[action.payload.step] = action.payload.value
            return {...state, employee};
        }

        else if (action.payload.type == 'service') {
            service = state.service
            service[action.payload.step] = action.payload.value
            return {...state, service};
        }
        return state;
        case 'REMOVE_FILTER':
            let newState = {}
            let steps = typeof action.payload == 'object' ? action.payload : [action.payload]
            Object.keys(state).forEach(type => {
                newState[type] = {}
                for (let key in state[type]) {
                    if (steps.filter(el => el != key).length) {
                        newState[type][key] = state[type][key]
                    }
                }                
            })
            return newState;
        case 'REMOVE_ALL_FILTERS' : return {employee: {}, service: {}};
        default: return state;
    }
}