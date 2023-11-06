export default function onlyUniq(arr, skip = '') {
    let repe = {}
    let uniq = []
    for (let key in arr) {
        if (key != skip) {
            arr[key].forEach(el => {
                if (typeof repe[el] == 'undefined') {
                        repe[el] = 1
                }
                else {
                    repe[el] = repe[el]+1 
                }
            })
        }
    }
    
    if (Object.keys(repe).length) {
        let length = Object.keys(arr).length
        if (skip)
            length = Object.keys(arr).filter(el => el != skip).length
        for (let key in repe) {
            if (repe[key] == length) uniq.push(Number(key))
        }
    }
    return uniq;
}