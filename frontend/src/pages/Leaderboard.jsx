import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard } from '../api'
import { Trophy, Medal, ArrowLeft, Clock } from 'lucide-react'

const PODIUM_COLORS = [
  'bg-yellow-400 text-gray-900',   // 1st
  'bg-gray-300 text-gray-900',     // 2nd
  'bg-orange-500 text-white',      // 3rd
]

const RANK_LABELS = ['🥇', '🥈', '🥉']

function fmtTime(secs) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}m ${s}s`
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const [board, setBoard]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard()
      .then(res => setBoard(res.data))
      .finally(() => setLoading(false))
  }, [])

  const top3 = board.slice(0, 3)
  const rest  = board.slice(3)

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate('/contest')} className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Trophy className="w-7 h-7 text-yellow-400" />
          <h1 className="text-3xl font-extrabold text-white">Leaderboard</h1>
          <button
            onClick={() => { setLoading(true); getLeaderboard().then(r => setBoard(r.data)).finally(() => setLoading(false)) }}
            className="ml-auto text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading rankings…</div>
        ) : board.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No participants yet.</div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 1 && (
              <div className="flex items-end justify-center gap-4 mb-12">
                {[top3[1], top3[0], top3[2]].map((entry, displayIdx) => {
                  if (!entry) return <div key={displayIdx} className="w-32" />
                  const rank = entry.rank
                  const heights = ['h-28', 'h-40', 'h-20']
                  return (
                    <div key={entry.user_id} className="flex flex-col items-center">
                      <div className="text-3xl mb-2">{RANK_LABELS[rank - 1]}</div>
                      <div className="font-bold text-white text-center text-sm mb-1">{entry.name}</div>
                      <div className="text-gray-500 text-xs mb-2">{entry.roll_no}</div>
                      <div className={`w-32 ${heights[displayIdx]} ${PODIUM_COLORS[rank - 1]} rounded-t-xl flex flex-col items-center justify-center`}>
                        <div className="text-2xl font-extrabold">{entry.total_score}</div>
                        <div className="text-xs font-semibold opacity-80">pts</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full Table */}
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 text-gray-400 text-left">
                    <th className="px-4 py-3 font-semibold">Rank</th>
                    <th className="px-4 py-3 font-semibold">Participant</th>
                    <th className="px-4 py-3 font-semibold text-red-400">R1 Bug Fix</th>
                    <th className="px-4 py-3 font-semibold text-yellow-400">R2 Output</th>
                    <th className="px-4 py-3 font-semibold text-green-400">R3 Reverse</th>
                    <th className="px-4 py-3 font-semibold text-indigo-400">Total</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((entry, i) => (
                    <tr
                      key={entry.user_id}
                      className={`border-t border-gray-800 transition ${i < 3 ? 'bg-indigo-600/5' : 'hover:bg-gray-800/50'}`}
                    >
                      <td className="px-4 py-3 font-bold text-gray-300">
                        {RANK_LABELS[i] || `#${entry.rank}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{entry.name}</div>
                        <div className="text-gray-500 text-xs">{entry.roll_no}</div>
                      </td>
                      <td className="px-4 py-3 text-red-300 font-mono">{entry.r1_score}</td>
                      <td className="px-4 py-3 text-yellow-300 font-mono">{entry.r2_score}</td>
                      <td className="px-4 py-3 text-green-300 font-mono">{entry.r3_score}</td>
                      <td className="px-4 py-3 font-extrabold text-indigo-300">{entry.total_score}</td>
                      <td className="px-4 py-3 text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {fmtTime(entry.total_time_seconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
