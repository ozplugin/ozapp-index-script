export default function services_cats(state = [],action) {
    switch(action.type) {
        case 'SET_CATS': return action.payload;
        default: return state;
    }
}