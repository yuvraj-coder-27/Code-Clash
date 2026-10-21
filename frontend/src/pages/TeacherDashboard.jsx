import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard, listTeams } from '../api'
import {
  GraduationCap, Trophy, Users, LogOut,
  CheckCircle, Clock, Download, RefreshCw
} from 'lucide-react'

function fmtTime(secs) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}m ${s}s`
}

export default function TeacherDashboard() {
  const navigate = useNavigate()

  const [tab, setTab]         = useState('leaderboard')
  const [board, setBoard]     = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('teacher_auth') !== 'true') {
      navigate('/teacher')
      return
    }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [lb, tm] = await Promise.all([getLeaderboard(), listTeams()])
      setBoard(lb.data || [])
      setTeams(tm.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('teacher_auth')
    navigate('/teacher')
  }

  // Export results CSV
  const exportCSV = () => {
    const header = 'Rank,Team Name,Members,R1 (C/C++),R2 (Python),R3 (DSA),Total Score,Total Time\n'
    const rows = board.map(e =>
      `${e.rank},"${e.team_name}","${e.members.join(' | ')}",${e.r1_score},${e.r2_score},${e.r3_score},${e.total_score},${fmtTime(e.total_time_seconds)}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'codeclash_team_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const RANK_ICONS = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Top Nav */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-base sm:text-lg">CodeClash — Teacher Portal</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition ml-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gray-900 border-gray-800 flex items-center gap-4">
            <div className="bg-indigo-600/20 p-3 rounded-xl">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{teams.length}</div>
              <div className="text-gray-400 text-xs">Registered Teams</div>
            </div>
          </div>
          <div className="card bg-gray-900 border-gray-800 flex items-center gap-4">
            <div className="bg-yellow-600/20 p-3 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white truncate max-w-[180px]">
                {board[0]?.team_name || '—'}
              </div>
              <div className="text-gray-400 text-xs">Current Leader</div>
            </div>
          </div>
          <div className="card bg-gray-900 border-gray-800 flex items-center gap-4">
            <div className="bg-green-600/20 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">
                {board[0]?.total_score ?? '—'} <span className="text-xs text-gray-500 font-normal">pts</span>
              </div>
              <div className="text-gray-400 text-xs">Top Score</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {['leaderboard', 'teams'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition border-b-2 -mb-px ${
                tab === t
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'leaderboard' ? '🏆 Leaderboard' : '👥 Teams Roster'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading team data…</div>
        ) : tab === 'leaderboard' ? (
          /* Leaderboard Table */
          <div className="card bg-gray-900 border-gray-800 overflow-x-auto p-0 shadow-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/80 text-gray-400 text-left text-xs uppercase font-semibold">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Team & Members</th>
                  <th className="px-4 py-3 text-red-400">R1 (C/C++)</th>
                  <th className="px-4 py-3 text-yellow-400">R2 (Python)</th>
                  <th className="px-4 py-3 text-green-400">R3 (DSA)</th>
                  <th className="px-4 py-3 text-purple-400">Total</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {board.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-10">No submissions yet.</td>
                  </tr>
                ) : (
                  board.map((entry, idx) => (
                    <tr key={entry.team_id} className={`border-t border-gray-800 ${idx < 3 ? 'bg-purple-950/10' : 'hover:bg-gray-800/30'}`}>
                      <td className="px-4 py-3 font-bold text-base">
                        {RANK_ICONS[idx] || `#${entry.rank}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{entry.team_name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {entry.members.join(' • ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-red-300">{entry.r1_score}</td>
                      <td className="px-4 py-3 font-mono text-yellow-300">{entry.r2_score}</td>
                      <td className="px-4 py-3 font-mono text-green-300">{entry.r3_score}</td>
                      <td className="px-4 py-3 font-mono font-bold text-purple-300 text-base">{entry.total_score}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {fmtTime(entry.total_time_seconds)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Teams Roster */
          <div className="card bg-gray-900 border-gray-800 overflow-x-auto p-0 shadow-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/80 text-gray-400 text-left text-xs uppercase font-semibold">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Team Name</th>
                  <th className="px-4 py-3">Member 1</th>
                  <th className="px-4 py-3">Member 2</th>
                  <th className="px-4 py-3">Member 3</th>
                  <th className="px-4 py-3">Round Assignments</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-10">No teams registered yet.</td>
                  </tr>
                ) : (
                  teams.map((t, idx) => (
                    <tr key={t.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-white">{t.team_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {t.member1_name} <span className="text-gray-500 font-mono">({t.member1_roll})</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {t.member2_name} <span className="text-gray-500 font-mono">({t.member2_roll})</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {t.member3_name ? (
                          <span>{t.member3_name} <span className="text-gray-500 font-mono">({t.member3_roll})</span></span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 space-y-0.5">
                        <div>R1: <span className="text-white">{t.round1_claimed_by || 'Unclaimed'}</span></div>
                        <div>R2: <span className="text-white">{t.round2_claimed_by || 'Unclaimed'}</span></div>
                        <div>R3: <span className="text-white">{t.round3_claimed_by || 'Unclaimed'}</span></div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
