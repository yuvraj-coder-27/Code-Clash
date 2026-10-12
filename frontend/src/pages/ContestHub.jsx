import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { Code2, Bug, Eye, Repeat2, Trophy, LogOut } from 'lucide-react'

const ROUNDS = [
  {
    id: 1,
    title: 'Bug Finding & Fixing',
    icon: <Bug className="w-8 h-8" />,
    color: 'from-red-900/40 to-red-800/20 border-red-700',
    badge: 'C & C++',
    badgeColor: 'bg-red-900 text-red-300',
    desc: 'Spot and fix bugs in C/C++ code. You have exactly 3 attempts per question — choose wisely!',
    rule: '🔒 3 attempts max per question',
    path: '/round/1',
  },
  {
    id: 2,
    title: 'Guess the Output',
    icon: <Eye className="w-8 h-8" />,
    color: 'from-yellow-900/40 to-yellow-800/20 border-yellow-700',
    badge: 'C & Python',
    badgeColor: 'bg-yellow-900 text-yellow-300',
    desc: 'Read the code snippet carefully and select the correct output from 4 MCQ options.',
    rule: '🎯 1 submission per question',
    path: '/round/2',
  },
  {
    id: 3,
    title: 'Reverse Coding',
    icon: <Repeat2 className="w-8 h-8" />,
    color: 'from-green-900/40 to-green-800/20 border-green-700',
    badge: 'C / C++ / Python',
    badgeColor: 'bg-green-900 text-green-300',
    desc: 'Given sample inputs and outputs, write code that reproduces the exact result.',
    rule: '🧪 Multiple test runs allowed',
    path: '/round/3',
  },
]

export default function ContestHub() {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  if (!user) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">

      {/* Top Bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">CodeClash</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            Hello, <span className="text-white font-semibold">{user.name}</span>
            <span className="text-gray-500 ml-2">({user.roll_no})</span>
          </span>
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-extrabold text-white mb-2">Select Your Round</h1>
        <p className="text-gray-400">Complete all 3 rounds to maximize your score. Fastest correct solver wins!</p>
      </div>

      {/* Round Cards */}
      <div className="max-w-4xl mx-auto grid gap-6">
        {ROUNDS.map((r) => (
          <div
            key={r.id}
            className={`bg-gradient-to-r ${r.color} border rounded-2xl p-6 flex items-center justify-between gap-6 cursor-pointer hover:scale-[1.01] transition-transform`}
            onClick={() => navigate(r.path)}
          >
            <div className="flex items-center gap-5">
              <div className="text-gray-300">{r.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-lg">Round {r.id}: {r.title}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.badgeColor}`}>{r.badge}</span>
                </div>
                <p className="text-gray-400 text-sm max-w-lg">{r.desc}</p>
                <p className="text-gray-500 text-xs mt-1.5 font-mono">{r.rule}</p>
              </div>
            </div>
            <button className="btn-secondary whitespace-nowrap">Start →</button>
          </div>
        ))}
      </div>
    </div>
  )
}
