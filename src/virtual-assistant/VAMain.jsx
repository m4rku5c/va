import React, {useState, useRef, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'

import './style/vamain.css'

import bot from '../virtual-assistant/assets/bot.png'

import VAHeader from './components/VAHeader'
import VABody from './components/VABody'
import VAInput from './components/VAInput'

import { startingQuestions, promptReponse } from './VAConfig'

const VAMain = () => {

  const [chatOpen, setChatOpen] = useState(false)
  const bottomRef = useRef(null)
  const currentSearch = useRef()  // currentSearch.current.value == 'sample' // usage
  const [chatLog, setChatLog] = useState([]) // format: {Question: '', Answer: ''}
  const [isBotVisible, setIsBotVisible] = useState(true)
  const [endChatModal, setEndChatModal] = useState(false)
  const [feedBackModal, setFeedBackModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [maxLimit, setMaxLimit] = useState(false)
  const goTo = useNavigate()

  async function getAnswer(question, confidenceScoreThreshold) {
    if(question == '') return

    const response = await fetch('http://localhost:5100/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, confidenceScoreThreshold }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error:', error)
      return
    }

    const data = await response.json()
    console.log('Answer:', data)
    currentSearch.current.value=''

    const results = [...data.answers[0].answer.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
    console.log('Result matching id from model:', results)
    handleAction(question, results[0])

  }

  const endChat = () => {
    setChatLog([])
  }

   useEffect(() => {
        if (!chatOpen) {
        const timer = setTimeout(() => {
            setIsBotVisible(true)
        }, 600)

        return () => clearTimeout(timer)
        } else {
        setIsBotVisible(false)
        }
    }, [chatOpen])

    useEffect(()=> {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
        console.log('ChatLog ATM:', chatLog)
    }, [chatLog])

    const functionConfig = [
        {id: 'EndChat', fn: endChat}
    ]

    function handleAction(prompt, actionToDo) {
        handleDeleteButtons()

        const item = promptReponse.find(r => r.id === actionToDo)
        if (!item) {
            console.error(`No prompt found for action "${actionToDo}"`)
            return
        }

        const queue = [];
        if (prompt != '') queue.push({ feed: prompt, type: 'question' })
        else if (item.text) queue.push({ feed: item.text, type: 'question' })
        if (item.answer) {
            queue.push(
            ...item.answer.map(a=> ({
                feed: a, type: 'answer'
            }))
            )
            }
        if (item.followUp) {
            queue.push(
            ...item.followUp.map(f => ({
                feed: f.button,
                type: 'button',
                action: f.action
            }))
            )
        }
        if (queue.length > 0) handleQueue(queue)

        if (item.link) goTo(item.link)
            
        if (item.fn) {
            functionConfig.find(i => i.id === item.fn)?.fn()
        }
    }

    const TypingDots = () => (
        <div className="typing-dots">
            <span>.</span><span>.</span><span>.</span>
        </div>
    )

    const renderChatItem = item => {
        switch (item.type) {
            case 'question':
                return <div className="va-open-chat-question">{item.feed}</div>
            case 'typing':
                return <div className="va-open-chat-typing"><TypingDots /></div>
            case 'head':
                return <div style={{display: 'flex', flexDirection: 'row'}}><div><img src={bot} style={{marginLeft: '5px'}}width={'20px'} height={'20px'}/></div><div className={`va-open-chat-answer fade-in`}>{item.feed}</div></div>
            case 'answer':
                return <div className={`va-open-chat-answer nothead fade-in`}>{item.feed}</div>
            case 'button':
                return (
                    <button className='va-txt-button nothead fade-in' onClick={()=>{handleAction('',item.action)}}>
                    <div className="va-open-chat-center">{item.feed}</div>
                    </button>)
            default:
                return <div className="va-open-chat-center">{item.feed}</div>
        }
    }

    const handleDeleteButtons = () => {
        setChatLog(prevChatLog => {
            // Find the last index that is not a button
            let lastNonButtonIndex = -1
            for (let i = prevChatLog.length - 1; i >= 0; i--) {
                if (prevChatLog[i]?.type !== 'button') {
                    lastNonButtonIndex = i
                    break;
                }
            }
            // Return array up to the last non-button element
            return lastNonButtonIndex >= 0 ? prevChatLog.slice(0, lastNonButtonIndex + 1) : []
        })
    }

    function handleQueue(queueArray) {
        const questionItems = queueArray.filter(item => item.type === 'question')
        const answerItems = queueArray.filter(item => item.type === 'answer')
        const buttonItems = queueArray.filter(item => item.type === 'button')

        // Show question(s) instantly
        if (questionItems.length > 0) {
            setChatLog(prev => [...prev, ...questionItems])
        }

        if (answerItems.length > 0) {
            answerItems[0] = { ...answerItems[0], type: 'head' }
        }

        // insert each answer with typing and fade-in
        const displayAnswersSequentially = async () => {
            setIsBotTyping(true)

            for (const answer of answerItems) {
            // Add "..." typing indicator
            setChatLog(prev => [...prev, { feed: '...', type: 'typing' }])

            await new Promise(resolve => setTimeout(resolve, 2000)) // delay before showing answer

            // Replace "..." with actual answer (add fade flag)
            setChatLog(prev => {
                const withoutTyping = prev.slice(0, -1); // remove last
                return [...withoutTyping, { ...answer, fadeIn: true }]
            })

            await new Promise(resolve => setTimeout(resolve, 500)) // short pause between answers
            }

            // Show buttons after all answers
            if (buttonItems.length > 0) {
                setChatLog(prev => [...prev, ...buttonItems])
            }

            setIsBotTyping(false)
        }

        if (answerItems.length > 0) {
            displayAnswersSequentially()
        } else if (buttonItems.length > 0) {
            setChatLog(prev => [...prev, ...buttonItems])
        }
    }

  return (
    <div className=''>

        {isBotVisible && (
            <div className="bot-container">
                <button className="va-remove-button-def" onClick={() => setChatOpen(true)}>
                    <img src={bot} width="75" height="75" alt="open chat" />
                </button>
            </div>
        )}

            <div className={`va-chat-open ${chatOpen ? 'open' : 'close'}`}>
                <VAHeader 
                    feedBackModal={feedBackModal}
                    setChatOpen={setChatOpen}
                    setEndChatModal={setEndChatModal}
                    endChat={endChat}
                    setFeedBackModal={setFeedBackModal}
                    chatLog={chatLog}
                />
                <VABody 
                    endChatModal={endChatModal}
                    setEndChatModal={setEndChatModal}
                    feedBackModal={feedBackModal}
                    setFeedBackModal={setFeedBackModal}
                    setRating={setRating}
                    chatLog={chatLog}
                    endChat={endChat}
                    handleQueue={handleQueue}
                    renderChatItem={renderChatItem}
                    bottomRef={bottomRef}
                    rating={rating}
                    setChatOpen={setChatOpen}
                />
                <VAInput 
                    endChatModal={endChatModal}
                    maxLimit={maxLimit}
                    setMaxLimit={setMaxLimit}
                    isBotTyping={isBotTyping}
                    currentSearch={currentSearch}
                    getAnswer={getAnswer}
                />
            </div>

        
    </div>
  )
}

export default VAMain