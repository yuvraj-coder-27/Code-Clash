import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

// Simple hardcoded teacher credentials (change as needed)
const TEACHER_PASSWORD = 'teacher123'

export default function TeacherLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === TEACHER_PASSWORD) {
      sessionStorage.setItem('teacher_auth', 'true')
      navigate('/teacher/dashboard')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="card w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-600 p-2.5 rounded-xl">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Teacher Login</h2>
            <p className="text-gray-500 text-xs">Contest Organizer Portal</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Access Password
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                required
                placeholder="Enter teacher password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-all">
            Access Dashboard →
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-5">
          Participant?{' '}
          <span
            className="text-indigo-400 cursor-pointer hover:underline"
            onClick={() => navigate('/')}
          >
            Go to contest
          </span>
        </p>
      </div>
    </div>
  )
}
