import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listUsers } from '../api'
import { useUser } from '../contexts/UserContext'

export default function Login() {
  const { login } = useUser()
  const navigate   = useNavigate()
  const [rollNo, setRollNo]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await listUsers()
      const found = res.data.find(u => u.roll_no === rollNo.trim())
      if (!found) {
        setError('Roll number not found. Please register first.')
      } else {
        login(found)
        navigate('/contest')
      }
    } catch {
      setError('Error connecting to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="card w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6">Welcome Back 👋</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Roll Number</label>
            <input
              type="text"
              required
              placeholder="e.g. CS22B001"
              value={rollNo}
              onChange={e => setRollNo(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Checking…' : 'Enter Contest →'}
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-5">
          New here?{' '}
          <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => navigate('/')}>Register</span>
        </p>
      </div>
    </div>
  )
}
