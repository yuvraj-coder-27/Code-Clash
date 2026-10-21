import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard } from '../api'
import { Trophy, ChevronLeft, Clock, RefreshCw, Users } from 'lucide-react'

function fmtTime(secs) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}m ${s}s`
}

const RANK_BADGES = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const navigate = useNavigate()
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBoard = () => {
    setLoading(true)
    getLeaderboard()
      .then(res => setBoard(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBoard()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">

      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/contest')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Contest
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h1 className="text-xl font-extrabold text-white">Live Team Leaderboard</h1>
        </div>

        <button
          onClick={fetchBoard}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Leaderboard Table Card */}
      <div className="max-w-5xl mx-auto card bg-gray-900 border-gray-800 p-0 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/80 text-gray-400 text-left border-b border-gray-800 text-xs uppercase tracking-wider font-semibold">
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Team & Members</th>
                <th className="px-5 py-3.5 text-red-400 text-center">R1 (C/C++)</th>
                <th className="px-5 py-3.5 text-yellow-400 text-center">R2 (Python)</th>
                <th className="px-5 py-3.5 text-green-400 text-center">R3 (DSA)</th>
                <th className="px-5 py-3.5 text-indigo-400 text-center">Total Pts</th>
                <th className="px-5 py-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-12">Loading live standings…</td>
                </tr>
              ) : board.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-12">No team submissions yet.</td>
                </tr>
              ) : (
                board.map((entry, idx) => (
                  <tr
                    key={entry.team_id}
                    className={`border-t border-gray-800/60 transition ${
                      idx < 3 ? 'bg-indigo-950/10' : 'hover:bg-gray-800/30'
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-base">
                      {RANK_BADGES[idx] || `#${entry.rank}`}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-base mb-1">{entry.team_name}</div>
                      <div className="text-xs text-gray-400 flex flex-wrap gap-1.5">
                        {entry.members.map((m, mIdx) => (
                          <span key={mIdx} className="bg-gray-800 px-2 py-0.5 rounded text-[11px] text-gray-300 font-mono">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center font-mono text-red-300 font-semibold">{entry.r1_score}</td>
                    <td className="px-5 py-4 text-center font-mono text-yellow-300 font-semibold">{entry.r2_score}</td>
                    <td className="px-5 py-4 text-center font-mono text-green-300 font-semibold">{entry.r3_score}</td>

                    <td className="px-5 py-4 text-center font-mono font-extrabold text-indigo-400 text-base">
                      {entry.total_score}
                    </td>

                    <td className="px-5 py-4 text-right font-mono text-xs text-gray-400">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {fmtTime(entry.total_time_seconds)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
