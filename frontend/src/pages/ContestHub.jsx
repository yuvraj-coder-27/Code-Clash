import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { claimRound, getTeamSubmissions } from '../api'
import { Code2, Bug, Terminal, Cpu, Trophy, LogOut, Users, RefreshCw, Lock, CheckCircle, Shield } from 'lucide-react'

const ROUNDS_META = [
  {
    id: 1,
    title: 'C & C++ Master',
    icon: <Bug className="w-7 h-7" />,
    badge: 'C / C++',
    badgeColor: 'bg-red-900/60 text-red-300 border border-red-700/50',
    color: 'from-red-950/40 to-gray-900 border-red-900/40 hover:border-red-600/50',
    desc: '5 MCQs + 5 Debugging challenges in C and C++.',
    rule: 'MCQs: 1 attempt (10 pts) | Debugging: 3 attempts with mark deduction (20 pts)',
  },
  {
    id: 2,
    title: 'Python Proficiency',
    icon: <Terminal className="w-7 h-7" />,
    badge: 'Python',
    badgeColor: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50',
    color: 'from-yellow-950/40 to-gray-900 border-yellow-900/40 hover:border-yellow-600/50',
    desc: '5 MCQs + 5 Debugging challenges in Python.',
    rule: 'MCQs: 1 attempt (10 pts) | Debugging: 3 attempts with mark deduction (20 pts)',
  },
  {
    id: 3,
    title: 'Data Structures & Algorithms',
    icon: <Cpu className="w-7 h-7" />,
    badge: 'DSA & Logic',
    badgeColor: 'bg-green-900/60 text-green-300 border border-green-700/50',
    color: 'from-green-950/40 to-gray-900 border-green-900/40 hover:border-green-600/50',
    desc: '5 MCQs + 5 Debugging problems on core DSA, searching, sorting & logic.',
    rule: 'MCQs: 1 attempt (10 pts) | Debugging: 3 attempts with mark deduction (20 pts)',
  },
]

export default function ContestHub() {
  const { team, currentMember, refreshTeam, logout } = useUser()
  const navigate = useNavigate()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!team) {
      navigate('/login')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const [freshTeam, subsRes] = await Promise.all([
        refreshTeam(),
        getTeamSubmissions(team.id),
      ])
      setSubmissions(subsRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimAndEnter = async (roundId) => {
    setErrorMsg('')
    const claimedByField = `round${roundId}_claimed_by`
    const owner = team[claimedByField]

    // If already owned by current member, proceed
    if (owner === currentMember) {
      navigate(`/round/${roundId}`)
      return
    }

    // If owned by someone else, block
    if (owner && owner !== currentMember) {
      setErrorMsg(`Round ${roundId} is already locked and assigned to ${owner}.`)
      return
    }

    // Attempt to claim
    setClaiming(roundId)
    try {
      const res = await claimRound({
        team_id: team.id,
        round_num: roundId,
        member_name: currentMember,
      })
      await refreshTeam()
      navigate(`/round/${roundId}`)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to claim round.')
    } finally {
      setClaiming(null)
    }
  }

  // Calculate scores per round
  const r1Score = submissions.filter(s => s.round === 1).reduce((acc, s) => acc + s.marks_awarded, 0)
  const r2Score = submissions.filter(s => s.round === 2).reduce((acc, s) => acc + s.marks_awarded, 0)
  const r3Score = submissions.filter(s => s.round === 3).reduce((acc, s) => acc + s.marks_awarded, 0)
  const totalScore = r1Score + r2Score + r3Score

  const solvedCount = submissions.filter(s => s.is_correct).length

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">

      {/* Header Bar */}
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white block leading-tight">{team?.team_name}</span>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5" /> Playing as: <span className="text-white underline">{currentMember}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Team
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-2 rounded-lg transition border border-yellow-500/20"
          >
            <Trophy className="w-3.5 h-3.5" /> Leaderboard
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition px-2 py-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Team Live Score Dashboard */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
        <div className="card bg-gray-900/70 border-gray-800 p-4">
          <span className="text-xs text-gray-400 block mb-1">Team Total Score</span>
          <span className="text-2xl font-extrabold text-white text-indigo-400">{totalScore.toFixed(1)} <span className="text-xs text-gray-500">pts</span></span>
        </div>
        <div className="card bg-gray-900/70 border-gray-800 p-4">
          <span className="text-xs text-red-400 block mb-1">R1 (C / C++)</span>
          <span className="text-xl font-bold text-white">{r1Score.toFixed(1)} <span className="text-xs text-gray-500">pts</span></span>
        </div>
        <div className="card bg-gray-900/70 border-gray-800 p-4">
          <span className="text-xs text-yellow-400 block mb-1">R2 (Python)</span>
          <span className="text-xl font-bold text-white">{r2Score.toFixed(1)} <span className="text-xs text-gray-500">pts</span></span>
        </div>
        <div className="card bg-gray-900/70 border-gray-800 p-4">
          <span className="text-xs text-green-400 block mb-1">R3 (DSA & Logic)</span>
          <span className="text-xl font-bold text-white">{r3Score.toFixed(1)} <span className="text-xs text-gray-500">pts</span></span>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-950/60 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Rules Banner */}
      <div className="max-w-5xl mx-auto mb-8 bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-2xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
        <p className="text-xs text-gray-300 leading-relaxed">
          <strong className="text-white">Team Rules:</strong> Each member should claim and complete <strong>one designated round</strong> matching their strengths. Points from all 3 members contribute simultaneously to your team score.
        </p>
      </div>

      {/* Round Cards */}
      <div className="max-w-5xl mx-auto space-y-4">
        {ROUNDS_META.map(r => {
          const claimedByField = `round${r.id}_claimed_by`
          const owner = team?.[claimedByField]
          const isOwnedByMe = owner === currentMember
          const isOwnedByOther = owner && !isOwnedByMe
          const isUnclaimed = !owner

          const roundSolved = submissions.filter(s => s.round === r.id && s.is_correct).length

          return (
            <div
              key={r.id}
              className={`bg-gradient-to-r ${r.color} border rounded-2xl p-6 transition-all ${
                isOwnedByOther ? 'opacity-70' : 'hover:scale-[1.005]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl text-gray-300">
                    {r.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-white font-bold text-lg">Round {r.id}: {r.title}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${r.badgeColor}`}>
                        {r.badge}
                      </span>

                      {/* Status Badges */}
                      {isOwnedByMe && (
                        <span className="text-xs bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                          Assigned to You
                        </span>
                      )}
                      {isOwnedByOther && (
                        <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3 text-red-400" /> Assigned to: <strong className="text-gray-300">{owner}</strong>
                        </span>
                      )}
                      {isUnclaimed && (
                        <span className="text-xs bg-gray-800/80 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
                          Unclaimed
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm max-w-xl">{r.desc}</p>
                    <p className="text-gray-500 text-xs mt-1.5 font-mono">{r.rule}</p>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="text-xs text-gray-400 font-mono">
                    <span className="text-white font-bold">{roundSolved}/10</span> Solved
                  </div>

                  {isOwnedByMe ? (
                    <button
                      onClick={() => navigate(`/round/${r.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
                    >
                      Continue Round →
                    </button>
                  ) : isOwnedByOther ? (
                    <button
                      disabled
                      className="bg-gray-800 text-gray-500 text-xs px-4 py-2.5 rounded-xl cursor-not-allowed border border-gray-700/50 flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Locked for You
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaimAndEnter(r.id)}
                      disabled={claiming === r.id}
                      className="bg-gray-800 hover:bg-indigo-600 text-white border border-gray-700 hover:border-indigo-500 font-semibold text-xs px-5 py-2.5 rounded-xl transition"
                    >
                      {claiming === r.id ? 'Claiming…' : 'Claim & Start →'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
