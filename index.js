import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './src/components/App';
import store from './src/store';

import oz_App from './src/classes/oz_App'

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('oz_appointment')) return;
    oz_vars.atts = document.getElementById('oz_appointment').dataset && document.getElementById('oz_appointment').dataset.atts ? JSON.parse(document.getElementById('oz_appointment').dataset.atts) : [] 
    window['oz_app'] = new oz_App();
    //oz_vars.steps = ['form', 'services',  'employees', 'date', 'time']
    oz_vars.steps = oz_vars.steps.join().split(',');
    oz_vars.activeStep = '';
    oz_vars.no_ava = '/conf/wp-content/plugins/book-appointment-online/assets/images/pers-ava.svg'; // фото если нет фото сотрудника
   // oz_vars.skipOneStep = 1; // опция страница для сотрудников
    oz_vars.animation = 700; // скорость прокрутки
    //oz_vars.skipemployee = 1; // выводить кнопку пропуска сотрудника
    if (oz_vars.onlyregistred)
    ReactDOM.render(<Provider store={store}><App config={oz_vars} /></Provider>, document.getElementById('oz_appointment'));
    else 
    ReactDOM.render(<>{oz_lang.r29}</>, document.getElementById('oz_appointment'))
})