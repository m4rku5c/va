import React from 'react'
import '../style/vaheader.css'

import minimize from '../assets/minimize.png'
import close from '../assets/close.png'

const VAHeader = (props) => {
  return (
    <div className='va-header'>
        <div>GSI Virtual Assistant</div>
        <div>
            <button className='va-remove-button-def va-button-grow' onClick={()=>{props.setChatOpen(false)}}>
                <img src={minimize} width={'25px'} height={'25px'}/>
            </button>
        </div>
        <div>
            <button className='va-remove-button-def va-button-grow' onClick={props.feedBackModal ? ()=>{ props.setChatOpen(false); props.setEndChatModal(false); const timerId = setTimeout(() => {props.endChat(); props.setFeedBackModal(false)}, 700)} : props.chatLog.length>=1 ? ()=>{props.setEndChatModal(true)} : ()=>{props.setChatOpen(false)}}>
                <img src={close} width={'25px'} height={'25px'}/>
            </button>
        </div>
    </div>
  )
}

export default VAHeader