import React from 'react'
import Navbar from './components/Navbar'
import { Router, Routes } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Router />
      </Routes>
    </div>
  )
}

export default App