import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useWindowSize from '../../hooks/useWindowSize'
import onlyUniq from '../../functions/onlyUniq'
import { getCookie } from '../../functions/functions';
import store from '../../store'




export default function AppSummary() {
    const size = useWindowSize();
    let summary = []
    const app_summary = useSelector(state => state.app_summary)
    const filter = useSelector(state => state.filter);
    let uniq = onlyUniq(filter.employee)

    const getState = () => {
      console.log(store.getState())
    }
  
    for (let key in app_summary) {
      let su = typeof app_summary[key] == 'object' ? JSON.stringify(app_summary[key]) : app_summary[key]
      su = su && su.length > 20 ? su.slice(0,20)+'...' : su
      summary.push(<li>{key} : {su}</li>)
    }

    return <div className="app_summary">
                <div>This window shows only for admin with enabled WP_DEBUG</div> 
                <div>Size: {size.width}x{size.height}</div> 
                {summary.map(el => el)} Found employees: {uniq.length}
                <div>Use Timezone? {!oz_app.u_tz() ? <span>Yes</span> : <span>No</span>}</div>
                <button onClick={getState}>Show State</button>
            </div>
}