import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './contexts/UserContext'
import Register         from './pages/Register'
import Login            from './pages/Login'
import ContestHub       from './pages/ContestHub'
import RoundPage        from './pages/RoundPage'
import Leaderboard      from './pages/Leaderboard'
import TeacherLogin     from './pages/TeacherLogin'
import TeacherDashboard from './pages/TeacherDashboard'

function ProtectedRoute({ children }) {
  const { team } = useUser()
  return team ? children : <Navigate to="/login" replace />
}

function TeacherRoute({ children }) {
  const auth = sessionStorage.getItem('teacher_auth') === 'true'
  return auth ? children : <Navigate to="/teacher" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                  element={<Register />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/contest"           element={<ProtectedRoute><ContestHub /></ProtectedRoute>} />
      <Route path="/round/:roundId"    element={<ProtectedRoute><RoundPage /></ProtectedRoute>} />
      <Route path="/leaderboard"       element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/teacher"           element={<TeacherLogin />} />
      <Route path="/teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
      <Route path="*"                  element={<Navigate to="/" replace />} />
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
