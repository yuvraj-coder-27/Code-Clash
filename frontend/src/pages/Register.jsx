import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerTeam } from '../api'
import { useUser } from '../contexts/UserContext'
import { Code2, Users, Shield, Zap, Plus, Trash2 } from 'lucide-react'

export default function Register() {
  const { login } = useUser()
  const navigate = useNavigate()

  const [hasThirdMember, setHasThirdMember] = useState(false)
  const [form, setForm] = useState({
    team_name: '',
    passcode: '',
    member1_name: '',
    member1_roll: '',
    member2_name: '',
    member2_roll: '',
    member3_name: '',
    member3_roll: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      team_name: form.team_name.trim(),
      passcode: form.passcode.trim(),
      member1_name: form.member1_name.trim(),
      member1_roll: form.member1_roll.trim(),
      member2_name: form.member2_name.trim(),
      member2_roll: form.member2_roll.trim(),
      member3_name: hasThirdMember ? form.member3_name.trim() : null,
      member3_roll: hasThirdMember ? form.member3_roll.trim() : null,
    }

    try {
      const res = await registerTeam(payload)
      login(res.data, payload.member1_name)
      navigate('/contest')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 py-12">

      {/* Hero Header */}
      <div className="mb-8 text-center max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">CodeClash</h1>
        </div>
        <p className="text-gray-400 text-base">
          Team Coding Championship — 3 Rounds, 10 Questions each.
          Form a team of 2 or 3, divide the rounds, and conquer the leaderboard!
        </p>
        <div className="flex justify-center gap-6 mt-4 text-xs font-semibold text-gray-500">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-red-400" /> R1: C & C++</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-400" /> R2: Python</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-green-400" /> R3: DSA & Logic</span>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="card w-full max-w-lg bg-gray-900/90 border-gray-800 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Register Team (2 or 3 Members)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Team Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Team Name</label>
              <input
                type="text"
                name="team_name"
                required
                placeholder="e.g. ByteBusters"
                value={form.team_name}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Team Secret Passcode</label>
              <input
                type="password"
                name="passcode"
                required
                placeholder="Passcode for all members"
                value={form.passcode}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Member 1 */}
          <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-800/80">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2.5">
              Member 1 (Team Leader)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="member1_name"
                required
                placeholder="Full Name"
                value={form.member1_name}
                onChange={handleChange}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="member1_roll"
                required
                placeholder="Roll / Reg No"
                value={form.member1_roll}
                onChange={handleChange}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Member 2 */}
          <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-800/80">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2.5">
              Member 2
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="member2_name"
                required
                placeholder="Full Name"
                value={form.member2_name}
                onChange={handleChange}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="member2_roll"
                required
                placeholder="Roll / Reg No"
                value={form.member2_roll}
                onChange={handleChange}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Optional Member 3 */}
          {hasThirdMember ? (
            <div className="bg-gray-950/60 p-4 rounded-xl border border-indigo-900/50 relative">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Member 3 (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => setHasThirdMember(false)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="member3_name"
                  required={hasThirdMember}
                  placeholder="Full Name"
                  value={form.member3_name}
                  onChange={handleChange}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="member3_roll"
                  required={hasThirdMember}
                  placeholder="Roll / Reg No"
                  value={form.member3_roll}
                  onChange={handleChange}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHasThirdMember(true)}
              className="w-full py-2.5 border border-dashed border-gray-700 rounded-xl text-xs font-medium text-gray-400 hover:text-indigo-300 hover:border-indigo-600 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Add 3rd Team Member (Optional)
            </button>
          )}

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs px-3.5 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Team…' : 'Register Team & Enter Contest →'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Teammate already registered your team?{' '}
          <span
            className="text-indigo-400 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            Log in to Team
          </span>
        </p>

        <p className="text-center mt-3 border-t border-gray-800 pt-3">
          <span
            className="text-gray-600 hover:text-gray-400 text-xs cursor-pointer transition"
            onClick={() => navigate('/teacher')}
          >
            Teacher / Organizer Portal
          </span>
        </p>
      </div>
    </div>
  )
}
