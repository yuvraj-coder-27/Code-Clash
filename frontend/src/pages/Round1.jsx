import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { getQuestions, submitBugFix } from '../api'
import { useUser } from '../contexts/UserContext'
import { Bug, AlertTriangle, CheckCircle, Lock, ChevronLeft } from 'lucide-react'

const LANG_MAP = { c: 'c', cpp: 'cpp' }
const MONACO_LANG = { c: 'c', cpp: 'cpp' }

export default function Round1() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [code, setCode]           = useState('')
  const [lang, setLang]           = useState('c')
  const [attempts, setAttempts]   = useState({})  // { qId: number }
  const [results, setResults]     = useState({})   // { qId: resultObj }
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    getQuestions(1).then(res => {
      setQuestions(res.data)
      if (res.data.length > 0) {
        setCode(res.data[0].code_template || '')
        setLang(res.data[0].language || 'c')
      }
    }).finally(() => setFetching(false))
  }, [])

  const q = questions[current]
  const qId = q?.id
  const attemptsUsed = attempts[qId] ?? 0
  const maxAttempts = 3
  const isLocked = attemptsUsed >= maxAttempts && !results[qId]?.is_correct
  const isSolved = results[qId]?.is_correct

  const handleSelect = (idx) => {
    const selQ = questions[idx]
    setCurrent(idx)
    setCode(selQ.code_template || '')
    setLang(selQ.language || 'c')
  }

  const handleSubmit = async () => {
    if (isLocked || isSolved || loading) return
    setLoading(true)
    try {
      const res = await submitBugFix({ user_id: user.id, question_id: qId, code, language: lang })
      setAttempts(prev => ({ ...prev, [qId]: res.data.attempts_used }))
      setResults(prev => ({ ...prev, [qId]: res.data }))
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading questions…</div>

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/contest')} className="text-gray-400 hover:text-white transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Bug className="w-5 h-5 text-red-400" />
        <span className="font-bold text-white">Round 1 — Bug Finding & Fixing</span>
        <span className="text-xs text-gray-500 ml-2">C & C++ only</span>
        <div className="ml-auto text-sm text-gray-400">
          Logged in as <span className="text-white font-semibold">{user?.name}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Question List Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Questions</div>
          {questions.map((q_, i) => {
            const used = attempts[q_.id] ?? 0
            const solved = results[q_.id]?.is_correct
            const locked = used >= maxAttempts && !solved
            return (
              <button
                key={q_.id}
                onClick={() => handleSelect(i)}
                className={`flex items-center gap-3 px-4 py-3 text-left text-sm transition ${
                  i === current ? 'bg-indigo-600/20 border-r-2 border-indigo-500 text-white' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1 truncate">{q_.title}</span>
                {solved && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                {locked && <Lock className="w-4 h-4 text-red-400 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        {q && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-1 overflow-hidden">

              {/* Problem Statement */}
              <div className="w-80 bg-gray-900/50 border-r border-gray-800 overflow-y-auto p-5 flex flex-col gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Problem</div>
                  <h2 className="text-lg font-bold text-white">{q.title}</h2>
                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">{q.description}</p>
                </div>

                {/* Attempt Counter */}
                <div className={`rounded-xl p-4 border ${isSolved ? 'bg-green-900/20 border-green-700' : isLocked ? 'bg-red-900/20 border-red-700' : 'bg-gray-800 border-gray-700'}`}>
                  <div className="text-xs font-semibold text-gray-400 mb-2">ATTEMPTS</div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                      <div
                        key={n}
                        className={`flex-1 h-2 rounded-full ${
                          n <= attemptsUsed
                            ? isSolved ? 'bg-green-500' : 'bg-red-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm mt-2 font-semibold">
                    {isSolved
                      ? <span className="text-green-400">✅ Solved! +{results[qId]?.marks_awarded} pts</span>
                      : isLocked
                        ? <span className="text-red-400">🔒 Locked — 0 pts</span>
                        : <span className="text-white">{attemptsUsed} / {maxAttempts} attempts used</span>
                    }
                  </div>
                </div>

                {/* Last Result */}
                {results[qId] && !isSolved && (
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 mb-2">LAST RESULT</div>
                    <div className="text-sm text-gray-300">{results[qId].execution_output}</div>
                    {results[qId].test_results?.filter(t => !t.is_hidden).map((t, i) => (
                      <div key={i} className={`mt-2 text-xs p-2 rounded-lg font-mono ${t.passed ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                        Test {i + 1}: {t.passed ? '✅ Pass' : `❌ Got "${t.actual}" expected "${t.expected}"`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-800">
                  <span className="text-xs text-gray-500">Language:</span>
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value)}
                    disabled={isLocked || isSolved}
                    className="bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 border border-gray-700"
                  >
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={MONACO_LANG[lang]}
                    value={code}
                    onChange={val => setCode(val || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      readOnly: isLocked || isSolved,
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="bg-gray-900 border-t border-gray-800 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {isLocked
                  ? <span className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4" /> Question locked — no attempts left</span>
                  : isSolved
                    ? <span className="flex items-center gap-2 text-green-400"><CheckCircle className="w-4 h-4" /> Solved!</span>
                    : `${maxAttempts - attemptsUsed} attempt(s) remaining`
                }
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLocked || isSolved || loading}
                className="btn-primary"
              >
                {loading ? 'Evaluating…' : isLocked ? 'Locked 🔒' : isSolved ? 'Solved ✅' : 'Submit Fix'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
