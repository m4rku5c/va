import React from 'react'
import '../style/vaheader.css'

import minimize from '../assets/minimize.png'
import close from '../assets/close.png'

const VAHeader = (feedBackModal, setChatOpen, setEndChatModal, chatLog, endChat) => {
  return (
    <div>
        <div>GSI Assistant</div>
        <div>
            <button className='' onClick={()=>{setChatOpen(false)}}>
                <img src={minimize} width={'25px'} height={'25px'}/>
            </button>
        </div>
        <div>
            <button className='' onClick={feedBackModal ? ()=>{ setChatOpen(false); setEndChatModal(false); const timerId = setTimeout(() => {endChat(); setFeedBackModal(false)}, 700)} : chatLog.length>=1 ? ()=>{setEndChatModal(true)} : ()=>{setChatOpen(false)}}>
                <img src={close} width={'25px'} height={'25px'}/>
            </button>
        </div>
    </div>
  )
}

export default VAHeader