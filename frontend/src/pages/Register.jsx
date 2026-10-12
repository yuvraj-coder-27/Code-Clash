import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api'
import { useUser } from '../contexts/UserContext'
import { Code2, Trophy, Zap } from 'lucide-react'

export default function Register() {
  const { login } = useUser()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', roll_no: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerUser(form)
      login(res.data)
      navigate('/contest')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">

      {/* Hero Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">CodeClash</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-md">
          A 3-round competitive coding contest — Bug Fixing, Output Guessing & Reverse Coding
        </p>
        <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-400" /> C</span>
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-cyan-400" /> C++</span>
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-green-400" /> Python</span>
        </div>
      </div>

      {/* Registration Card */}
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-white">Register to Compete</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Arjun Sharma"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Roll Number</label>
            <input
              type="text"
              required
              placeholder="e.g. CS22B001"
              value={form.roll_no}
              onChange={e => setForm({ ...form, roll_no: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Registering…' : 'Enter the Contest →'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-5">
          Already registered?{' '}
          <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => navigate('/login')}>
            Login here
          </span>
        </p>
        <p className="text-center mt-3">
          <span
            className="text-gray-700 hover:text-gray-500 text-xs cursor-pointer transition"
            onClick={() => navigate('/teacher')}
          >
            Teacher / Organizer Login
          </span>
        </p>
      </div>

      {/* Round Overview */}
      <div className="grid grid-cols-3 gap-4 mt-10 w-full max-w-2xl">
        {[
          { round: 'Round 1', title: 'Bug Fixing', color: 'border-red-600', icon: '🐛', desc: '3 attempts max per question' },
          { round: 'Round 2', title: 'Guess Output', color: 'border-yellow-500', icon: '🤔', desc: 'MCQ — 1 attempt only' },
          { round: 'Round 3', title: 'Reverse Code', color: 'border-green-500', icon: '🔁', desc: 'Match target output' },
        ].map(r => (
          <div key={r.round} className={`bg-gray-900 border-t-4 ${r.color} rounded-xl p-4 text-center`}>
            <div className="text-3xl mb-2">{r.icon}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">{r.round}</div>
            <div className="font-bold text-white mt-1">{r.title}</div>
            <div className="text-xs text-gray-400 mt-1">{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
