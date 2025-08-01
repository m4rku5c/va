import React, {useState, useRef, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'

import './style/vamain.css'

import bot from '../virtual-assistant/assets/bot.png'

import VAHeader from './components/VAHeader'
import VABody from './components/VABody'
import VAInput from './components/VAInput'

import promptReponse from '../../../PR.json'

const VAMain = () => {

    const [csrfToken, setCsrfToken] = useState('')
    const [chatOpen, setChatOpen] = useState(false)
    const bottomRef = useRef(null)
    const currentSearch = useRef() 
    const [chatLog, setChatLog] = useState([])
    const [isBotVisible, setIsBotVisible] = useState(true)
    const [endChatModal, setEndChatModal] = useState(false)
    const [feedBackModal, setFeedBackModal] = useState(false)
    const [rating, setRating] = useState(0)
    const [isBotTyping, setIsBotTyping] = useState(false)
    const [maxLimit, setMaxLimit] = useState(false)
    const goTo = useNavigate()



    useEffect(() => {
        async function fetchToken() {
        try {
            const response = await fetch('https://gsi-virtual-assistant-webapp.azurewebsites.net/csrf-token', {
            credentials: 'include' 
            })
            const data = await response.json()
            console.log(`Token recieved: ${data.csrfToken}`)
            setCsrfToken(data.csrfToken)
        } catch (e) {
            console.error('Failed to fetch CSRF token', e)
        }
        }

        fetchToken()
    }, [])

    const removeInitialTypingAnimation = () => {
        setChatLog(prev => {
            const withoutTyping = prev.slice(0, -1)
            return [...withoutTyping]
        })
    }

    async function getAnswer(question) {
        if (!question) return

       

        try {
            // this will send message right away, rather relying on handleaction to queue after api retrieves faster
            // "looks" more reponsive this way, user has something to wait for 
            currentSearch.current.value = ''
            handleDeleteButtons()
            handleQueue([{ feed: question, type: 'question' }])
            // show typing while waiting for answer to form / api to clear
            setChatLog(prev => [...prev, { feed: '...', type: 'typing' }])

            console.log(`csrfToken ${csrfToken}`)

            const response = await fetch('https://gsi-virtual-assistant-webapp.azurewebsites.net/ask/id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            credentials: 'include', 
            body: JSON.stringify({ question })
            })

            if (response.status === 429) {
                removeInitialTypingAnimation()
                const error = await response.json().catch(() => null)
                console.error('Server Error:', error || response.status)  
                currentSearch.current.value = ''
                return handleAction('instant', 'tooManyRequests')
            }
            else if (!response.ok) {
                removeInitialTypingAnimation()
                const error = await response.json().catch(() => null)
                console.error('Server Error:', error || response.status)
                currentSearch.current.value = ''
                return handleAction('instant', 'default')
            }

            

            const data = await response.json()
            console.log('Answer:', data)

            

            //const results = [...data.answers[0].answer.matchAll(/\[([^\]]+)\]/g)].map(m => m[1])
            //console.log('Result IDs:', results)

            // remove animation for typing otherwise it will show double when handleAction executes
            removeInitialTypingAnimation()
            //handleAction('instant', results[0])
            handleAction('instant', data[0])
        } catch (error) {
            removeInitialTypingAnimation()
            console.error('Network Error:', error)
            return handleAction('instant', 'noConnection')
        }
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
        // console.log('ChatLog ATM:', chatLog)
    }, [chatLog])

    const functionConfig = [
        {id: 'EndChat', fn: endChat}
    ]

    async function handleAction(prompt, actionToDo) {
        // console.log('running handle action')
        await handleDeleteButtons()

        const item = promptReponse.find(r => r.id === actionToDo)
        if (!item) {
            console.error(`No prompt found for action "${actionToDo}"`)
            return
        }

        const queue = []
        if (prompt == 'instant') queue.push() // use this when u want to ignore question
        else if (prompt != '') queue.push({ feed: prompt, type: 'question' }) // anything else if u want to force own str
        else if (item.text) queue.push({ feed: item.text, type: 'question' }) // if empty str, use the text in json corresponding to the action in PR.json
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
                return <div style={{display: 'flex', flexDirection: 'row'}}><div><img src={bot} style={{marginLeft: '5px'}}width={'20px'} height={'20px'}/></div><TypingDots /></div>
            case 'head':
                return <div style={{display: 'flex', flexDirection: 'row'}}><div><img src={bot} style={{marginLeft: '5px'}}width={'20px'} height={'20px'}/></div><div className={`va-open-chat-answer fade-in`}>{item.feed}</div></div>
            case 'answer':
                return <div className={`va-open-chat-answer nothead fade-in`}>{item.feed}</div>
            case 'button':
                return (
                    <button className='va-menu-button chatItem nothead fade-in' onClick={()=>{handleAction('',item.action)}}>
                        {item.feed}
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
                    break
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

        // top answer should have the virutal assitant icon next to
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
                const withoutTyping = prev.slice(0, -1) // remove last
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
                    csrfToken={csrfToken}
                />
                <VAInput 
                    endChatModal={endChatModal}
                    maxLimit={maxLimit}
                    setMaxLimit={setMaxLimit}
                    isBotTyping={isBotTyping}
                    currentSearch={currentSearch}
                    getAnswer={getAnswer}
                    csrfToken={csrfToken}
                />
            </div>
    </div>
  )
}

export default VAMain