import React, {useState, useRef, useEffect} from 'react'

import bot from '../virtual-assistant/assets/bot.png'

import VAHeader from './components/VAHeader'
import VABody from './components/VABody'
import VAInput from './components/VAInput'


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
            
        if (item.fn) item.fn()
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
            case 'answer':
                return <div className={`va-open-chat-answer fade-in`}>{item.feed}</div>
            case 'button':
                return (
                    <button className='va-txt-button fade-in' onClick={()=>{handleAction('',item.action)}}>
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


  return (
    <div style={{position: 'absolute', bottom: 0, right: 0, display: 'flex', flexDirection: 'column'}}>

        {isBotVisible && (
            <div className="">
                <button className="" onClick={() => setChatOpen(true)}>
                    <img src={bot} width="75" height="75" alt="open chat" />
                </button>
            </div>
        )}

        {chatOpen && (
            <div>
                <VAHeader 
                    feedBackModal={feedBackModal}
                    setChatOpen={setChatOpen}
                    setEndChatModal={setEndChatModal}
                    endChat={endChat}
                    setFeedBackModal={setFeedBackModal}
                    chatLog={chatLog}
                />
                <VABody />
                <VAInput />
            </div>
        )}

        
    </div>
  )
}

export default VAMain