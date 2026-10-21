import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { getQuestions, getTeamSubmissions, submitMCQ, submitDebugging } from '../api'
import { useUser } from '../contexts/UserContext'
import {
  ChevronLeft, CheckCircle2, XCircle, Lock,
  AlertTriangle, Play, HelpCircle, Code, RefreshCw
} from 'lucide-react'

const ROUND_TITLES = {
  1: { name: 'Round 1: C & C++ Master', lang: 'c', badge: 'C / C++' },
  2: { name: 'Round 2: Python Proficiency', lang: 'python', badge: 'Python' },
  3: { name: 'Round 3: Data Structures & Algorithms', lang: 'cpp', badge: 'DSA & Logic' },
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function RoundPage() {
  const { roundId } = useParams()
  const rId = parseInt(roundId, 10)
  const navigate = useNavigate()
  const { team, currentMember, refreshTeam } = useUser()

  const [questions, setQuestions]     = useState([])
  const [currentIdx, setCurrentIdx]   = useState(0)
  const [submissions, setSubmissions] = useState({}) // { [qid]: subObj }
  const [fetching, setFetching]       = useState(true)

  // Editor / Input state for current question
  const [code, setCode]               = useState('')
  const [lang, setLang]               = useState('c')
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => {
    if (!team) {
      navigate('/login')
      return
    }

    // Access check: verify round is assigned to current member
    const claimedBy = team[`round${rId}_claimed_by`]
    if (claimedBy && claimedBy !== currentMember) {
      alert(`Round ${rId} is locked and assigned to ${claimedBy}.`)
      navigate('/contest')
      return
    }

    loadRound()
  }, [rId])

  const loadRound = async () => {
    setFetching(true)
    try {
      const [qRes, subRes] = await Promise.all([
        getQuestions(rId),
        getTeamSubmissions(team.id),
      ])

      const qList = qRes.data || []
      setQuestions(qList)

      // Map submissions by question_id
      const subMap = {}
      ;(subRes.data || []).forEach(s => {
        subMap[s.question_id] = s
      })
      setSubmissions(subMap)

      if (qList.length > 0) {
        setupQuestion(0, qList, subMap)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to load round questions.')
    } finally {
      setFetching(false)
    }
  }

  const setupQuestion = (idx, qList = questions, subMap = submissions) => {
    setCurrentIdx(idx)
    const q = qList[idx]
    if (!q) return

    const sub = subMap[q.id]
    if (q.question_type === 'mcq') {
      setSelectedOpt(sub ? sub.selected_option : null)
    } else {
      setCode(sub?.submitted_code || q.code_template || '')
      setLang(q.language || 'c')
    }
  }

  const handleSelectQ = (idx) => {
    setupQuestion(idx)
  }

  const q = questions[currentIdx]
  const sub = q ? submissions[q.id] : null
  const isMCQ = q?.question_type === 'mcq'
  const isSolved = sub?.is_correct || false
  const attemptsUsed = sub?.attempts_used || 0
  const isLocked = isMCQ ? attemptsUsed >= 1 : (attemptsUsed >= 3 && !isSolved)

  // MCQ Submission
  const handleSubmitMCQ = async () => {
    if (selectedOpt === null || isLocked || submitting) return
    setSubmitting(true)
    try {
      const res = await submitMCQ({
        team_id: team.id,
        member_name: currentMember,
        question_id: q.id,
        selected_option: selectedOpt,
      })
      setSubmissions(prev => ({ ...prev, [q.id]: res.data }))
      await refreshTeam()
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Debugging Submission
  const handleSubmitDebugging = async () => {
    if (isLocked || isSolved || submitting) return
    setSubmitting(true)
    try {
      const res = await submitDebugging({
        team_id: team.id,
        member_name: currentMember,
        question_id: q.id,
        code,
        language: lang,
      })
      setSubmissions(prev => ({ ...prev, [q.id]: res.data }))
      await refreshTeam()
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading Round {rId} Questions…
      </div>
    )
  }

  const roundMeta = ROUND_TITLES[rId] || { name: `Round ${rId}`, badge: '' }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Top Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contest')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Hub
          </button>
          <div className="h-4 w-px bg-gray-800" />
          <span className="text-sm font-bold text-white">{roundMeta.name}</span>
          <span className="text-xs bg-indigo-950 border border-indigo-800/80 text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
            {roundMeta.badge}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">
            Player: <strong className="text-white">{currentMember}</strong> ({team?.team_name})
          </span>
          <button
            onClick={loadRound}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigator + Question Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar (Question List 1 to 10) */}
        <div className="w-64 bg-gray-900/60 border-r border-gray-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Questions (10)
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {questions.map((item, idx) => {
              const itemSub = submissions[item.id]
              const itemSolved = itemSub?.is_correct
              const itemAtt = itemSub?.attempts_used || 0
              const itemType = item.question_type === 'mcq' ? 'MCQ' : 'DEBUG'
              const itemLocked = item.question_type === 'mcq'
                ? itemAtt >= 1 && !itemSolved
                : itemAtt >= 3 && !itemSolved

              const isCurrent = currentIdx === idx

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectQ(idx)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-600/20 text-white'
                      : 'border-transparent hover:bg-gray-800/50 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-400 w-4">{idx + 1}.</span>
                    <div>
                      <div className="font-semibold text-white truncate max-w-[120px]">{item.title}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-mono">{itemType} • {item.points} pts</div>
                    </div>
                  </div>

                  <div>
                    {itemSolved ? (
                      <span className="text-[10px] bg-green-950 border border-green-800 text-green-400 font-bold px-1.5 py-0.5 rounded">
                        +{itemSub.marks_awarded}
                      </span>
                    ) : itemLocked ? (
                      <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 font-bold px-1.5 py-0.5 rounded">
                        Locked
                      </span>
                    ) : itemAtt > 0 ? (
                      <span className="text-[10px] bg-yellow-950 border border-yellow-800 text-yellow-400 font-mono px-1.5 py-0.5 rounded">
                        {itemAtt}/3
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600">•</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col bg-gray-950 overflow-y-auto">
          {q && (
            <div className="p-6 max-w-4xl w-full mx-auto space-y-6">

              {/* Question Header Card */}
              <div className="card bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300">
                      Q{currentIdx + 1} • {isMCQ ? 'Guess the Output (MCQ)' : 'Bug Finding & Fixing'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono uppercase bg-gray-800 px-2 py-0.5 rounded">
                      {q.language}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-indigo-400 font-mono">
                    {q.points} Points
                  </div>
                </div>

                <h1 className="text-xl font-bold text-white mb-2">{q.title}</h1>
                <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{q.description}</p>

                {/* Attempt Status Badge for Debugging */}
                {!isMCQ && (
                  <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">Attempts Used:</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map(attNum => (
                          <span
                            key={attNum}
                            className={`px-2 py-0.5 rounded font-mono font-bold ${
                              attNum <= attemptsUsed
                                ? isSolved && attNum === attemptsUsed
                                  ? 'bg-green-600 text-white'
                                  : 'bg-red-800 text-red-200'
                                : 'bg-gray-800 text-gray-500'
                            }`}
                          >
                            Att {attNum} ({attNum === 1 ? '100%' : attNum === 2 ? '70%' : '40%'})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      {isSolved && (
                        <span className="text-green-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Solved (+{sub.marks_awarded} pts)
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-red-400 font-semibold flex items-center gap-1">
                          <Lock className="w-4 h-4" /> Locked (3 attempts exhausted)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── MCQ INTERFACE ─── */}
              {isMCQ ? (
                <div className="space-y-6">

                  {/* Code Snippet */}
                  {q.code_template && (
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-2 font-mono uppercase">
                        Code Snippet:
                      </span>
                      <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto text-sm font-mono text-cyan-300 leading-relaxed">
                        <code>{q.code_template}</code>
                      </pre>
                    </div>
                  )}

                  {/* 4 MCQ Option Cards */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 block mb-3 font-mono uppercase">
                      Select Output (1 Attempt Allowed):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(q.mcq_options || []).map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx
                        const isSubmitted = attemptsUsed >= 1

                        let style = 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
                        if (!isSubmitted && isSelected) {
                          style = 'border-indigo-500 bg-indigo-600/20 text-white'
                        } else if (isSubmitted) {
                          if (isSelected && isSolved) {
                            style = 'border-green-600 bg-green-950/60 text-green-300 font-semibold'
                          } else if (isSelected && !isSolved) {
                            style = 'border-red-600 bg-red-950/60 text-red-300'
                          } else {
                            style = 'border-gray-800/40 bg-gray-950/50 text-gray-600 cursor-not-allowed'
                          }
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => !isSubmitted && setSelectedOpt(optIdx)}
                            className={`p-4 rounded-xl border text-sm font-mono flex items-center gap-3 transition ${
                              isSubmitted ? 'cursor-default' : 'cursor-pointer'
                            } ${style}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold shrink-0">
                              {OPTION_LETTERS[optIdx]}
                            </span>
                            <span className="break-all whitespace-pre-wrap">{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action / Result */}
                  <div className="flex items-center justify-between pt-2">
                    {sub ? (
                      <div className={`text-sm font-semibold flex items-center gap-2 ${isSolved ? 'text-green-400' : 'text-red-400'}`}>
                        {isSolved ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {sub.execution_output}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 font-mono">
                        ⚠️ Only 1 attempt allowed. Double check before submitting!
                      </div>
                    )}

                    {!sub && (
                      <button
                        onClick={handleSubmitMCQ}
                        disabled={selectedOpt === null || submitting}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                      >
                        {submitting ? 'Checking…' : 'Submit Answer →'}
                      </button>
                    )}
                  </div>

                </div>
              ) : (

                /* ─── DEBUGGING INTERFACE ─── */
                <div className="space-y-4">

                  {/* Monaco Editor Header */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-indigo-400" /> Fix the code below:
                    </span>
                    <button
                      onClick={() => setCode(q.code_template || '')}
                      disabled={isLocked || isSolved}
                      className="text-gray-500 hover:text-gray-300 transition text-[11px]"
                    >
                      Reset Template
                    </button>
                  </div>

                  {/* Monaco Editor */}
                  <div className="border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                    <Editor
                      height="380px"
                      language={q.language === 'cpp' ? 'cpp' : q.language === 'c' ? 'c' : 'python'}
                      value={code}
                      onChange={val => setCode(val || '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        readOnly: isLocked || isSolved,
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        fontFamily: 'JetBrains Mono, Menlo, monospace',
                      }}
                    />
                  </div>

                  {/* Submit Button & Execution status */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-gray-400">
                      {isSolved ? (
                        <span className="text-green-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Solved! ({sub.marks_awarded} pts awarded)
                        </span>
                      ) : isLocked ? (
                        <span className="text-red-400 font-semibold flex items-center gap-1">
                          <Lock className="w-4 h-4" /> Locked: 3 attempts used
                        </span>
                      ) : (
                        <span>Attempts remaining: <strong className="text-white">{3 - attemptsUsed}</strong> of 3</span>
                      )}
                    </div>

                    {!isSolved && !isLocked && (
                      <button
                        onClick={handleSubmitDebugging}
                        disabled={submitting}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {submitting ? 'Running Test Cases…' : `Submit Code (Attempt ${attemptsUsed + 1}/3)`}
                      </button>
                    )}
                  </div>

                  {/* Test Case Feedback Box */}
                  {sub && (
                    <div className="card bg-gray-900 border-gray-800 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-400">Execution Result:</span>
                        <span className={isSolved ? 'text-green-400' : 'text-yellow-400'}>
                          {sub.execution_output}
                        </span>
                      </div>

                      {/* Individual test case results */}
                      {sub.test_results && (
                        <div className="space-y-2 pt-2 border-t border-gray-800">
                          {sub.test_results.map((tr, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                                tr.passed
                                  ? 'border-green-900/60 bg-green-950/30 text-green-300'
                                  : 'border-red-900/60 bg-red-950/30 text-red-300'
                              }`}
                            >
                              <span>
                                Case #{idx + 1}: {tr.is_hidden ? '[Hidden Test Case]' : `Input: ${JSON.stringify(tr.input)}`}
                              </span>
                              <span className="font-bold">
                                {tr.passed ? '✓ PASSED' : '✗ FAILED'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>

      </div>

    </div>
  )
}

