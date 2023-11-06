import React, { useCallback, useEffect, useState } from 'react';

export default function Timer(props) {
    const [time,setTime] = useState(props.time || 60);
    const show = typeof props.show != 'undefined' ? props.show : true

    useEffect(() => {
        let timer = setTimeout(() => {
            if (time <= 0) {
                clearTimeout(timer)
                if (typeof props.onEnd == 'function') {
                    props.onEnd()
                }
            }
            else {
                let t = time -1
            setTime(t);
            }
        }, 1000)
        return () => { clearTimeout(timer) };
    }, [time])
       
    return <>{show != false && moment().startOf('day').seconds(time).format('mm:ss')}</>;
}