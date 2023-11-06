import store from '../store';

export default async function submitForm(response) {
    let summary = store.getState()
    if (!response || !response.id) {
    let body = new URLSearchParams();
    body.set('action', 'do_zapis')
    Object.entries(summary.app_summary).map(el => {
          // fix если услуга бесплатная, чтобы не проходила оплата
          if (el[0] == 'oz_payment_method' && (typeof summary.app_summary['oz_order_sum'] == 'undefined' || !summary.app_summary['oz_order_sum']) ) { }     
          else
          body.set(el[0], el[1])
    })
    store.dispatch({type: 'LOADING'})
    response = await (await fetch(oz_vars.oz_ajax_url, {
        method: 'post',
        body,
        }
    )).json();
    store.dispatch({type: 'LOADED'})
    }
    if (response.id) {
            store.dispatch(
              {
                type: 'APPOINTEMNT_COMPLETED',
                payload: response
              }
              )
			var event= new CustomEvent('ozBookSend',{detail:{response}});
			document.addEventListener('ozBookSend',function(){},false);
			document.dispatchEvent(event);
            setTimeout(() => {document.querySelector('.oz-form').remove()},1000)
            window.scrollTo({
              top: document.getElementById('oz_appointment').getBoundingClientRect().top + window.scrollY,
              behavior: "smooth"
          })
    }

    else if (response.pending) {
            // ошибка stripe and woocommerce
            if (response.text.error) {
                store.dispatch({
                    type: 'SET_POPUP',
                    payload: {
                      text: response.text.error.message,
                      buttons: [
                        {
                          name: oz_lang.r26,
                          action: 'close'
                        },
                    ]
                    }
                  })
            }
            // ошибка paypal
            else if (response.text.result && response.text.result.status != 'CREATED') {
                store.dispatch({
                    type: 'SET_POPUP',
                    payload: {
                      text: response.text.result.message,
                      buttons: [
                        {
                          name: oz_lang.r26,
                          action: 'close'
                        },
                    ]
                    }
                  })
            }

            // ошибка yoomoney
            else if (response.text.type && response.text.type == 'error') {
                store.dispatch({
                    type: 'SET_POPUP',
                    payload: {
                      text: response.text.description,
                      buttons: [
                        {
                          name: oz_lang.r26,
                          action: 'close'
                        },
                    ]
                    }
                  })
            }

            else {
                let tpl = null
                let url = null
                let rest = {}
                let buttons = [
                  {
                    name: oz_lang.r26,
                    action: 'close'
                  },
              ]

                if (oz_vars.paymentInThisTab && url) {
                  location.href = url
                  return false;
              }

                store.dispatch({
                    type: 'SET_POPUP',
                    payload: {
                      ...rest,
                      text: tpl,
                      buttons
                    }
                  })
            }
    }

    else if (response.confirm) {
      store.dispatch({type: 'SUBMIT_FORM'})
      if (response.text == 'error')
      store.dispatch({type: 'SET_FIELD_ERROR', payload:'oz_otp_code'})
    }

    else if (response.error || (response.text && response.text.error)) {
      let error = response.error ? response.text : response.text.error
        store.dispatch({
            type: 'SET_POPUP',
            payload: {
              text: error,
              buttons: [
                {
                  name: oz_lang.r26,
                  action: 'close'
                },
            ]
            }
          })
    }

}