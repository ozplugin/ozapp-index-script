import React, { useState, useEffect, useCallback } from 'react';

import Service from './Service'




export default function Cat(props) {
    const cat = props.cat
    const services = props.services
    const [isOpen, setOpen] = useState(props.isOpen)
    const handlClick = () => {
      setOpen(!isOpen)
    }
    return (
    <>
    <p className={`oz_cats_title oz_link ${isOpen ? 'cats_open' : ''}`} onClick={handlClick}>
      {cat.name}
      {' '}
      <svg version="1.1" id="oz_arrow" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                     width="444.819px" height="444.819px" viewBox="0 0 444.819 444.819">
                    <path d="M434.252,114.203l-21.409-21.416c-7.419-7.04-16.084-10.561-25.975-10.561c-10.095,0-18.657,3.521-25.7,10.561
                        L222.41,231.549L83.653,92.791c-7.042-7.04-15.606-10.561-25.697-10.561c-9.896,0-18.559,3.521-25.979,10.561l-21.128,21.416
                        C3.615,121.436,0,130.099,0,140.188c0,10.277,3.619,18.842,10.848,25.693l185.864,185.865c6.855,7.23,15.416,10.848,25.697,10.848
                        c10.088,0,18.75-3.617,25.977-10.848l185.865-185.865c7.043-7.044,10.567-15.608,10.567-25.693
                        C444.819,130.287,441.295,121.629,434.252,114.203z"/>
      </svg>
    </p>
    <ul className={`listUslug ${!isOpen ? 'oz_hide' : ''}`}>{services.map(service => <Service service={service} />)}</ul>
    </>     
    )
}