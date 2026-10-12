import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard, listUsers, getQuestions } from '../api'
import {
  GraduationCap, Trophy, Users, LogOut,
  CheckCircle, XCircle, Clock, Download
} from 'lucide-react'

const ROUND_LABELS = {
  1: { label: 'Bug Fixing', color: 'text-red-400' },
  2: { label: 'Guess Output', color: 'text-yellow-400' },
  3: { label: 'Reverse Coding', color: 'text-green-400' },
}

function fmtTime(secs) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}m ${s}s`
}

export default function TeacherDashboard() {
  const navigate = useNavigate()

  const [tab, setTab]               = useState('leaderboard')  // 'leaderboard' | 'participants'
  const [board, setBoard]           = useState([])
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)

  // Check auth
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
      const [lb, us] = await Promise.all([getLeaderboard(), listUsers()])
      setBoard(lb.data)
      setUsers(us.data)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('teacher_auth')
    navigate('/teacher')
  }

  // Export leaderboard as CSV
  const exportCSV = () => {
    const header = 'Rank,Name,Roll No,Round 1,Round 2,Round 3,Total Score,Total Time\n'
    const rows = board.map(e =>
      `${e.rank},"${e.name}",${e.roll_no},${e.r1_score},${e.r2_score},${e.r3_score},${e.total_score},${fmtTime(e.total_time_seconds)}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'codeclash_results.csv'
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
          <span className="font-bold text-white text-lg">CodeClash — Teacher Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card flex items-center gap-4">
            <div className="bg-indigo-600/20 p-3 rounded-xl">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{users.length}</div>
              <div className="text-gray-500 text-sm">Registered Participants</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="bg-yellow-600/20 p-3 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">
                {board[0]?.name || '—'}
              </div>
              <div className="text-gray-500 text-sm">Current Leader</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="bg-green-600/20 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">
                {board[0]?.total_score ?? '—'}
              </div>
              <div className="text-gray-500 text-sm">Top Score</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {['leaderboard', 'participants'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition border-b-2 -mb-px ${
                tab === t
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'leaderboard' ? '🏆 Leaderboard' : '👥 Participants'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading data…</div>
        ) : tab === 'leaderboard' ? (

          /* ── Leaderboard Tab ── */
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3 text-red-400">R1 Bug Fix</th>
                  <th className="px-4 py-3 text-yellow-400">R2 Output</th>
                  <th className="px-4 py-3 text-green-400">R3 Reverse</th>
                  <th className="px-4 py-3 text-purple-400">Total</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {board.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-10">No submissions yet.</td>
                  </tr>
                ) : board.map((entry, i) => (
                  <tr key={entry.user_id} className={`border-t border-gray-800 ${i < 3 ? 'bg-purple-600/5' : 'hover:bg-gray-800/40'}`}>
                    <td className="px-4 py-3 font-bold text-lg">
                      {RANK_ICONS[i] || `#${entry.rank}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{entry.name}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{entry.roll_no}</td>
                    <td className="px-4 py-3 text-red-300 font-mono">{entry.r1_score}</td>
                    <td className="px-4 py-3 text-yellow-300 font-mono">{entry.r2_score}</td>
                    <td className="px-4 py-3 text-green-300 font-mono">{entry.r3_score}</td>
                    <td className="px-4 py-3 font-extrabold text-purple-300 text-base">{entry.total_score}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs flex items-center gap-1 mt-3">
                      <Clock className="w-3.5 h-3.5" />{fmtTime(entry.total_time_seconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          /* ── Participants Tab ── */
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-10">No participants registered yet.</td>
                  </tr>
                ) : users.map((u, i) => (
                  <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/40">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.roll_no}</td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
