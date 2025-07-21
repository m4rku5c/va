import React from 'react'

import '../style/vainput.css'

import send from '../assets/send.png'
import senddisable from '../assets/senddisable.png'

const VAInput = (props) => {
  return (
    <div className={`va-input ${props.endChatModal ? 'va-hide' : ''}`}>
      <input disabled={props.isBotTyping} maxLength={'200'} className={`va-text-box ${props.maxLimit ? 'va-text-box-limit' : 'va-text-box-unlimit'}`}
             onChange={(e) => {
                        const value = e.target.value;
                        if (value.length == 200) {
                          props.setMaxLimit(true);
                        } else {props.setMaxLimit(false)}
                      }}
              type='text' ref={props.currentSearch} 
              placeholder={props.isBotTyping ? 'Please Wait...' : 'Ask the Assistant'}
        />
          <button disabled={props.isBotTyping} className='va-remove-button-def' onClick={()=>props.getAnswer(props.currentSearch.current.value, 0.5)}><img className='va-img-button' src={props.isBotTyping ? senddisable : send}/></button>
      </div>
  )
}

export default VAInput