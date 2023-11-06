import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function ServiceLine(props) {
    const dispatch = useDispatch()
    const service = props.service
    const block_back = useSelector(state => state.app.block_back)
    const paymentMethod = useSelector(state => state.app_summary.oz_payment_method)
    const haveDeposit = ((paymentMethod && paymentMethod != 'locally') || oz_vars.woocommerce)
                        && service.deposit && service.deposit.value > 0 
                        && !(service.deposit.type == 'percent' && service.deposit.percent == 100)
                        && !block_back
    const [DepositEnabled, setDepositEnabled] = useState(false)
    const deposits = useSelector(state => state.app_summary.oz_use_deposit)
    let isRecur = useSelector(state => state.app_summary.recurring)
    let depositValue = isRecur && isRecur.length ? service.deposit.value * (isRecur.length+1) : service.deposit.value

    const handleSwitch = () => {
        setDepositEnabled(!DepositEnabled)
    }    

    useEffect(() => {
        if (deposits.length && !oz_vars.woocommerce && (!paymentMethod || paymentMethod == 'locally')) {
            dispatch({type: 'RESET_DEPOSIT'})
            setDepositEnabled(!DepositEnabled)
            return;
        }
        if (DepositEnabled) {
            dispatch({
                type: 'SET_DEPOSIT',
                payload: service.id
            })
        }
        else {
            if (deposits.length)
            dispatch({
                type: 'REMOVE_DEPOSIT',
                payload: service.id
            })            
        }
    }, [DepositEnabled, paymentMethod])

    if (!haveDeposit) {
        return <span class="oz_nodeposit">{service.title}{!props.isLast && ', '}</span>    
    }

    return <div class="oz_flex oz_flex-center"><span>{service.title}</span>
        {haveDeposit && <div class="oz_flex oz_deposit_switcher oz_flex-center">
                        <span className="oz_switch_label">{oz_lang.r32} {service.deposit.type == 'percent' ? service.deposit.percent+'%' : depositValue+oz_vars.currency}</span>
                        <span onClick={handleSwitch} className={`oz_switch ${DepositEnabled ? 'active' : ''}`}>
                            <span className="oz_switch_dot"></span>
                        </span>
                        </div>}
    </div>
}