import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Calendar from '@/pages/Calendar'
import Settings from '@/pages/Settings'
import TaskDetails from '@/pages/TaskDetails'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
