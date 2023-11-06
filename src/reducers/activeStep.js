export default function activeStep(state = {active: '', current: ''},action) {
    switch(action.type) {
        case 'SET_ACTIVE_STEP': return [...state, active : action.payload];
        case 'SET_CURRENT_STEP': return [...state, current : action.payload];
        default: return state;
    }
}