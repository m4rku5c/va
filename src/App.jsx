import React from 'react'
import {Route, Routes} from 'react-router-dom'

import VAMain from './virtual-assistant/VAMain'

import Dashboard from './pages/Dashboard'

const App = () => {
  return (
    <>
    <VAMain/>
    <Routes>
      <Route path={'/'} element={<Dashboard/>} />


    </Routes>
    </>
  )
}

export default App