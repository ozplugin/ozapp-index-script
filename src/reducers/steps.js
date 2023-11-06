export default function steps(state = [],action) {
    switch(action.type) {
        case 'SET_STEPS': return action.payload;
        case 'SKIP_IF_ONE_EMPLOYEE': 
        case 'SKIP_IF_ONE_SERVICE':
        if (state.indexOf('recurring') > -1 && action.payload.steps.indexOf('recurring') < 0) {
            return action.payload.steps.reduce((arr, el) => {
                if (el == 'form')
                arr.push('recurring'); 
                arr.push(el); 
                return arr}, [])
        }
        else {
        return action.payload.steps;
        }
        default: return state;
    }
}