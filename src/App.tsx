import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Onboarding } from '@/components/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Calendar from '@/pages/Calendar'
import Tasks from '@/pages/Tasks'
import Notes from '@/pages/Notes'
import Help from '@/pages/Help'
import Settings from '@/pages/Settings'
import TaskDetails from '@/pages/TaskDetails'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('antigravity_onboarding_complete')
    setShowOnboarding(!onboardingComplete)
    setIsLoading(false)
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (isLoading) {
    return null
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
