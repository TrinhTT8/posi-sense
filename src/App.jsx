import { useState } from 'react'
import LandingPage from './components/LandingPage'
import InterviewSession from './components/InterviewSession'
import './App.css'

function App() {
  const [sessionActive, setSessionActive] = useState(false)

  return (
    <div className="app">
      {sessionActive ? (
        <InterviewSession onEnd={() => setSessionActive(false)} />
      ) : (
        <LandingPage onStart={() => setSessionActive(true)} />
      )}
    </div>
  )
}

export default App
