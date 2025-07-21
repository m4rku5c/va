import React from 'react'
import {Link} from 'react-router-dom'

import '../style/vabody.css'

import { startingQuestions, promptReponse } from '../VAConfig';

const VABody = (props) => {
  return (
    <div>
      {props.endChatModal && (
        <div className=''>
          {props.feedBackModal ? 
            (
              <div className='feedback-modal'>
                <div>Rate Your Experience</div>
                <div>
                  {[1,2,3,4,5].map((value) =>
                    <span
                      key={value}
                      onClick={() => props.setRating(value)}
                      style={{ cursor: 'pointer', fontSize: '40px' }}
                    >
                      {value <= props.rating ? '★' : '☆'}
                    </span>
                  )}
                </div>
                <div>Help Us By Providing Feedback</div>
                <input className='va-feedback-input' type='text'/>
                <button className='va-txt-button' onClick={() => { props.setChatOpen(false); props.setEndChatModal(false); const timerId = setTimeout(() => {props.endChat(); props.setFeedBackModal(false)}, 700)}}>Submit</button>
              </div>
              ) : 
              (
                <>
                  <h3>End Chat?</h3>
                  <div>
                    <button className='va-txt-button' onClick={() =>props.setFeedBackModal(true)}>Yes</button>
                    <button className='va-txt-button' onClick={()=>props.setEndChatModal(false)}>No</button>
                  </div>
                </>
              )
          }
              
        </div>
      )}
      
      <div style={{marginTop: '10px'}}className={` ${props.endChatModal ? 'va-hide' : ''}`}>
        {props.chatLog.length == 0 ? (
          <div className={``}>
            {startingQuestions.map(item => (
              <div className='va-common-content' key={item.link}>
                {item.link !== 'NA' ?  
                  // Redirect buttons
                  <Link key={item.link} to={item.link}>
                    <button className='va-menu-button' 
                          onClick={() => {
                              const queue = [
                                  { feed: item?.text, type: 'question' },
                                  ...item?.answer.map(a => ({ feed: a, type: 'answer' })),
                                  ...item?.followUp?.map(followUp => ({ feed: followUp?.button, type: 'button', action: followUp?.action })),
                              ];
                          props.handleQueue(queue);
                      }}>
                      <div>{item.text}</div>
                    </button>
                  </Link>
                  :
                  // Only Answer buttons
                  <button className='va-menu-button' 
                      onClick={() => {
                          const queue = [
                              { feed: item?.text, type: 'question' },
                              
                              ...item?.followUp?.map(followUp => ({ feed: followUp?.button, type: 'button', action: followUp?.action })),
                              ];
                          props.handleQueue(queue);
                      }}>
                      <div>{item.text}</div>
                  </button>
                }
              </div>
            ))}
          </div>
          )
          :
          (
          <div className='va-scroll-content'>
            {props.chatLog.map((item, index) => (
              <React.Fragment key={`${item.feed}-${index}`}>
                {props.renderChatItem(item)}
              </React.Fragment>
            ))}
            <div ref={props.bottomRef} />
          </div>
        )}
      </div>

    </div>
  )
}

export default VABody