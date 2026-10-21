import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions, submitMCQ } from '../api'
import { useUser } from '../contexts/UserContext'
import { Eye, CheckCircle, XCircle, ChevronLeft } from 'lucide-react'

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

function CodeSnippet({ code, language }) {
  return (
    <pre className="bg-gray-950 border border-gray-700 rounded-xl p-5 overflow-x-auto text-sm font-mono text-cyan-300 leading-relaxed">
      <code>{code}</code>
    </pre>
  )
}

export default function Round2() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [questions, setQuestions]       = useState([])
  const [current, setCurrent]           = useState(0)
  const [selected, setSelected]         = useState({})  // { qId: optionIndex }
  const [submitted, setSubmitted]       = useState({})  // { qId: result }
  const [loading, setLoading]           = useState(false)
  const [fetching, setFetching]         = useState(true)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    getQuestions(2).then(res => setQuestions(res.data)).finally(() => setFetching(false))
  }, [])

  const q = questions[current]
  const qId = q?.id
  const isSubmitted = !!submitted[qId]
  const result = submitted[qId]

  const handleSubmit = async () => {
    if (isSubmitted || selected[qId] === undefined || loading) return
    setLoading(true)
    try {
      const res = await submitMCQ({ user_id: user.id, question_id: qId, selected_option: selected[qId] })
      setSubmitted(prev => ({ ...prev, [qId]: res.data }))
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission error')
    } finally {
      setLoading(false)
    }
  }

  const getOptionClass = (idx) => {
    const isSelected = selected[qId] === idx
    if (!isSubmitted) {
      return isSelected
        ? 'border-indigo-500 bg-indigo-600/20 text-white'
        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700 cursor-pointer'
    }
    // After submission
    const correct = result?.test_results ? null : null  // we get correct via is_correct
    if (isSelected && result?.is_correct) return 'border-green-500 bg-green-900/30 text-green-300'
    if (isSelected && !result?.is_correct) return 'border-red-500 bg-red-900/30 text-red-300'
    return 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading questions…</div>

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/contest')} className="text-gray-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Eye className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-white">Round 2 — Guess the Output</span>
        <span className="text-xs text-gray-500 ml-2">MCQ • 1 attempt per question</span>
        <div className="ml-auto text-sm text-gray-400">
          <span className="text-white font-semibold">{user?.name}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Questions</div>
          {questions.map((q_, i) => {
            const done = !!submitted[q_.id]
            const correct = submitted[q_.id]?.is_correct
            return (
              <button
                key={q_.id}
                onClick={() => setCurrent(i)}
                className={`flex items-center gap-3 px-4 py-3 text-left text-sm transition ${
                  i === current ? 'bg-yellow-500/10 border-r-2 border-yellow-400 text-white' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1 truncate">{q_.title}</span>
                {done && (
                  correct
                    ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Main */}
        {q && (
          <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
            <div className="mb-2 text-xs text-gray-500 uppercase tracking-widest">
              Question {current + 1} / {questions.length} • Language: {q.language.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white mb-4">{q.title}</h2>

            {/* Code snippet */}
            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-widest">Code Snippet</div>
              <CodeSnippet code={q.code_template} language={q.language} />
            </div>

            {/* Options */}
            <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-widest">Select the correct output:</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {q.mcq_options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => !isSubmitted && setSelected(prev => ({ ...prev, [qId]: idx }))}
                  className={`flex items-center gap-3 border rounded-xl p-4 text-left transition font-mono text-sm ${getOptionClass(idx)}`}
                >
                  <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center font-bold text-xs shrink-0">
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="whitespace-pre-wrap">{opt}</span>
                </button>
              ))}
            </div>

            {/* Result feedback */}
            {isSubmitted && (
              <div className={`rounded-xl p-4 border mb-6 ${result.is_correct ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-red-900/20 border-red-700 text-red-300'}`}>
                {result.is_correct
                  ? `✅ Correct! +${result.marks_awarded} pts awarded`
                  : `❌ ${result.execution_output}`
                }
              </div>
            )}

            {/* Navigation + Submit */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => current > 0 && setCurrent(c => c - 1)}
                  disabled={current === 0}
                  className="btn-secondary disabled:opacity-40"
                >← Prev</button>
                <button
                  onClick={() => current < questions.length - 1 && setCurrent(c => c + 1)}
                  disabled={current === questions.length - 1}
                  className="btn-secondary disabled:opacity-40"
                >Next →</button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitted || selected[qId] === undefined || loading}
                className="btn-primary"
              >
                {loading ? 'Submitting…' : isSubmitted ? 'Submitted ✓' : 'Confirm Answer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
