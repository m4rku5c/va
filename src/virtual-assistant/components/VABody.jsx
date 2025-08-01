import React, {useState, useRef, use} from 'react'
import {Link} from 'react-router-dom'

import '../style/vabody.css'
import emptystar from '../assets/emptystar.png'
import fullstar from '../assets/star.png'

import startingQuestions from '../../../../SQ.json'

const VABody = (props) => {

  const [hoverValue, setHoverValue] = useState(0)
  const feedback = useRef()

  const handleClick = starValue => {
    if (starValue === props.rating) {
      props.setRating(0)
    } else {
      props.setRating(starValue)
    }
  }

  const handleFeedbackSubmission = async () => {
    //console.log(`Rating: ${props.rating}, Feedback: ${feedback.current.value}`)
    try {
      const feedbackInput = feedback.current.value
      const ratingInput = props.rating
      const response = await fetch('https://gsi-virtual-assistant-webapp.azurewebsites.net/giveRatingFeedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': props.csrfToken
            },
            credentials: 'include', 
            body: JSON.stringify({ ratingInput, feedbackInput })
            })
    } catch (error) {
      console.log(`Error ${error}`)
    }
    props.setRating(0)
  }

  return (
    <div style={props.chatLog.length < 1 ? {marginTop: 'auto'} : {marginTop: '10px'}}>
      {props.endChatModal && (
        <div className='va-endchat-modal'>
          {props.feedBackModal ? 
            (
              <div className='feedback-modal'>
                <div className='va-txt-lrg'>Rate Your Experience</div>
                <div className='va-feedback-star-div' onMouseLeave={() => setHoverValue(0)}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const starValue = i + 1
                    const filled = hoverValue ? starValue <= hoverValue : starValue <= props.rating
                    return (
                      <img className="va-feedback-img-star" key={i} src={filled ? fullstar : emptystar}
                        width="25px" height="25px"
                        onClick={() => handleClick(starValue)} onMouseEnter={() => setHoverValue(starValue)}
                      />
                    )
                  })}
                </div>
                <div>Help us improve the chat experience by providing feedback</div>
                <textarea maxLength={200} ref={feedback} className="va-feedback-input" rows="1" placeholder="Your feedback..."/>
                <button className='va-menu-button feedback' onClick={() => { handleFeedbackSubmission(); props.setChatOpen(false); props.setEndChatModal(false); const timerId = setTimeout(() => {props.endChat(); props.setFeedBackModal(false)}, 700)}}>Submit</button>
              </div>
              ) : 
              (
                <div className='feedback-modal'>
                  <h3>End Chat ?</h3>
                  <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                    <button className='va-menu-button bigger' onClick={() =>props.setFeedBackModal(true)}>Yes</button>
                    <button className='va-menu-button bigger' onClick={()=>props.setEndChatModal(false)}>No</button>
                  </div>
                </div>
              )
          }
              
        </div>
      )}
      
      <div style={{}} className={` ${props.endChatModal ? 'va-hide' : ''}`}>
        {props.chatLog.length == 0 ? (
          <div className={``}>
            <h1 style={{textAlign: 'center'}}>Main Menu</h1>
            {startingQuestions.map(item => (
              <div className='va-common-content' key={item.link}>
                {item.link !== 'NA' ?  
                  // Redirect buttons
                  <Link key={item.link} to={item.link}>
                    <button className='va-menu-button menu-bigger' 
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
                  <button className='va-menu-button menu-bigger' 
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
                }
              </div>
            ))}
            <h3 style={{textAlign: 'center'}}>Need more help? Ask the assistant!</h3>
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