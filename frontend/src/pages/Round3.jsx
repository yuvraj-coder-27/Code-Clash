import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { getQuestions, submitReverse } from '../api'
import { useUser } from '../contexts/UserContext'
import { Repeat2, CheckCircle, ChevronLeft } from 'lucide-react'

const MONACO_MAP = { c: 'c', cpp: 'cpp', python: 'python' }

const LANG_TEMPLATES = {
  python: `# Write your solution here\n`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
}

export default function Round3() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [lang, setLang]           = useState('python')
  const [code, setCode]           = useState('')
  const [results, setResults]     = useState({})   // { qId: lastResult }
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    getQuestions(3).then(res => {
      setQuestions(res.data)
      if (res.data.length > 0) setCode(res.data[0].code_template || '')
    }).finally(() => setFetching(false))
  }, [])

  const q = questions[current]
  const qId = q?.id
  const lastResult = results[qId]
  const isSolved = lastResult?.is_correct

  const handleSelect = (idx) => {
    setCurrent(idx)
    setCode(questions[idx].code_template || '')
  }

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await submitReverse({ user_id: user.id, question_id: qId, code, language: lang })
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
        <button onClick={() => navigate('/contest')} className="text-gray-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Repeat2 className="w-5 h-5 text-green-400" />
        <span className="font-bold text-white">Round 3 — Reverse Coding</span>
        <span className="text-xs text-gray-500 ml-2">C / C++ / Python</span>
        <div className="ml-auto text-sm text-gray-400">
          <span className="text-white font-semibold">{user?.name}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Questions</div>
          {questions.map((q_, i) => {
            const solved = results[q_.id]?.is_correct
            const tried  = !!results[q_.id]
            return (
              <button
                key={q_.id}
                onClick={() => handleSelect(i)}
                className={`flex items-center gap-3 px-4 py-3 text-left text-sm transition ${
                  i === current ? 'bg-green-500/10 border-r-2 border-green-500 text-white' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1 truncate">{q_.title}</span>
                {solved && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                {tried && !solved && <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Main */}
        {q && (
          <div className="flex-1 flex overflow-hidden">
            {/* Problem Panel */}
            <div className="w-96 bg-gray-900/50 border-r border-gray-800 overflow-y-auto p-5 flex flex-col gap-5">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Problem</div>
                <h2 className="text-lg font-bold text-white">{q.title}</h2>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{q.description}</p>
              </div>

              {/* Visible test cases as I/O table */}
              {q.test_cases?.filter(tc => !tc.is_hidden).length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Sample I/O</div>
                  {q.test_cases.filter(tc => !tc.is_hidden).map((tc, i) => (
                    <div key={i} className="mb-3 bg-gray-800 rounded-xl overflow-hidden">
                      <div className="flex">
                        <div className="flex-1 p-3 border-r border-gray-700">
                          <div className="text-xs text-gray-500 mb-1">Input</div>
                          <pre className="text-cyan-300 text-xs font-mono">{tc.input || '(none)'}</pre>
                        </div>
                        <div className="flex-1 p-3">
                          <div className="text-xs text-gray-500 mb-1">Expected Output</div>
                          <pre className="text-green-300 text-xs font-mono">{tc.expected_output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-gray-600 italic">+ hidden test cases will be evaluated on submit</div>
                </div>
              )}

              {/* Last Result */}
              {lastResult && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Last Submission</div>
                  <div className={`rounded-xl p-3 border text-sm font-semibold ${lastResult.is_correct ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-yellow-900/20 border-yellow-700 text-yellow-300'}`}>
                    {lastResult.execution_output}
                    <span className="ml-2 text-xs font-normal">+{lastResult.marks_awarded} pts</span>
                  </div>
                  {lastResult.test_results?.filter(t => !t.is_hidden).map((t, i) => (
                    <div key={i} className={`mt-2 text-xs p-2 rounded-lg font-mono ${t.passed ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                      Case {i + 1}: {t.passed ? '✅ Pass' : `❌ Got "${t.actual}" | Expected "${t.expected}"`}
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
                  onChange={e => {
                    setLang(e.target.value)
                    setCode(LANG_TEMPLATES[e.target.value] || '')
                  }}
                  className="bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 border border-gray-700"
                >
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
                <span className="text-xs text-gray-600 ml-auto">Attempts: {lastResult?.attempts_used ?? 0} runs</span>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={MONACO_MAP[lang]}
                  value={code}
                  onChange={val => setCode(val || '')}
                  theme="vs-dark"
                  options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                />
              </div>
              <div className="bg-gray-900 border-t border-gray-800 px-6 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {isSolved
                    ? <span className="text-green-400">✅ Fully solved! All test cases passed.</span>
                    : 'Fix your code and run again. Multiple attempts allowed.'}
                </span>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                  {loading ? 'Running…' : isSolved ? 'Run Again' : 'Submit & Test'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
