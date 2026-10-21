import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginTeam } from '../api'
import { useUser } from '../contexts/UserContext'
import { Code2, Users, Check, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useUser()
  const navigate = useNavigate()

  const [form, setForm] = useState({ team_name: '', passcode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 2: Member selection on this device
  const [teamData, setTeamData] = useState(null)
  const [selectedMember, setSelectedMember] = useState('')

  const handleTeamAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginTeam(form)
      setTeamData(res.data)
      // Default to member1
      setSelectedMember(res.data.member1_name)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid team name or passcode.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMember = () => {
    if (!selectedMember || !teamData) return
    login(teamData, selectedMember)
    navigate('/contest')
  }

  const members = teamData
    ? [
        { name: teamData.member1_name, roll: teamData.member1_roll },
        { name: teamData.member2_name, roll: teamData.member2_roll },
        ...(teamData.member3_name ? [{ name: teamData.member3_name, roll: teamData.member3_roll }] : []),
      ]
    : []

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="card w-full max-w-md bg-gray-900 border-gray-800 p-8">

        {/* Logo & Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/20">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Team Login</h2>
            <p className="text-gray-400 text-xs">Enter with your team's credentials</p>
          </div>
        </div>

        {!teamData ? (
          /* Step 1: Team Name + Passcode */
          <form onSubmit={handleTeamAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Team Name</label>
              <input
                type="text"
                required
                placeholder="Your registered team name"
                value={form.team_name}
                onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Team Passcode</label>
              <input
                type="password"
                required
                placeholder="Team secret passcode"
                value={form.passcode}
                onChange={e => setForm(f => ({ ...f, passcode: e.target.value }))}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs px-3.5 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Verifying…' : 'Authenticate Team →'}
            </button>
          </form>
        ) : (
          /* Step 2: Select who is on this device */
          <div className="space-y-5">
            <div className="bg-indigo-950/40 border border-indigo-800/60 p-3.5 rounded-xl">
              <span className="text-xs text-indigo-300 font-semibold block mb-0.5">Team Authenticated</span>
              <span className="text-sm font-bold text-white">{teamData.team_name}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Who is playing on this laptop/device?
              </label>
              <div className="space-y-2">
                {members.map(m => {
                  const isSelected = selectedMember === m.name
                  return (
                    <div
                      key={m.name}
                      onClick={() => setSelectedMember(m.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white'
                          : 'border-gray-800 bg-gray-950/60 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-white">{m.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{m.roll}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmMember}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
            >
              Enter Contest as {selectedMember} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          Don't have a team yet?{' '}
          <span
            className="text-indigo-400 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate('/')}
          >
            Register Team
          </span>
        </p>
      </div>
    </div>
  )
}
