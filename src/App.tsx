import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Onboarding } from '@/components/Onboarding'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { authService, supabase } from '@/services/authService'
import Dashboard from '@/pages/Dashboard'
import Calendar from '@/pages/Calendar'
import Tasks from '@/pages/Tasks'
import Notes from '@/pages/Notes'
import Help from '@/pages/Help'
import Settings from '@/pages/Settings'
import TaskDetails from '@/pages/TaskDetails'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthAndOnboarding()

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkAuthAndOnboarding = async () => {
    try {
      const session = await authService.getSession()
      setIsAuthenticated(!!session)

      // Check onboarding only if authenticated
      if (session) {
        // Check if user has completed onboarding by checking if they have a username in profile
        // standard onboarding saves username to profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()

        if (profile?.username) {
          setShowOnboarding(false)
          // Sync local storage just in case
          localStorage.setItem('antigravity_onboarding_complete', 'true')
        } else {
          // Fallback to local storage or show onboarding
          const localCompleted = localStorage.getItem('antigravity_onboarding_complete')
          setShowOnboarding(!localCompleted)
        }
      }
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F5132] to-[#1e7e34] dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show onboarding if authenticated but hasn't completed it
  if (isAuthenticated && showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
