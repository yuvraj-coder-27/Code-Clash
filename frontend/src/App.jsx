import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './contexts/UserContext'
import Register    from './pages/Register'
import Login       from './pages/Login'
import ContestHub  from './pages/ContestHub'
import Round1      from './pages/Round1'
import Round2      from './pages/Round2'
import Round3      from './pages/Round3'
import Leaderboard from './pages/Leaderboard'

function ProtectedRoute({ children }) {
  const { user } = useUser()
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"            element={<Register />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/contest"     element={<ProtectedRoute><ContestHub /></ProtectedRoute>} />
      <Route path="/round/1"     element={<ProtectedRoute><Round1 /></ProtectedRoute>} />
      <Route path="/round/2"     element={<ProtectedRoute><Round2 /></ProtectedRoute>} />
      <Route path="/round/3"     element={<ProtectedRoute><Round3 /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  )
}
