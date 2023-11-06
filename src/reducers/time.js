export default function time(state = {},action) {
    switch(action.type) {
        case 'SET_TIME': if (!Object.keys(action.payload).length) return {};  return {...state, ...action.payload}
        case 'SET_MTIME':  return {...state, mtime:action.payload}
        default: return state;
    }
}