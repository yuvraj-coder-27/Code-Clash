import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: BASE_URL })

export const registerUser   = (data) => api.post('/users/register', data)
export const getUser        = (id)   => api.get(`/users/${id}`)
export const listUsers      = ()     => api.get('/users/')

export const getQuestions   = (round) => api.get(`/questions/round/${round}`)
export const createQuestion = (data)  => api.post('/questions/', data)
export const deleteQuestion = (id)    => api.delete(`/questions/${id}`)

export const submitBugFix   = (data) => api.post('/submit/round1', data)
export const submitMCQ      = (data) => api.post('/submit/round2', data)
export const submitReverse  = (data) => api.post('/submit/round3', data)
export const getSubmission  = (uid, qid) => api.get(`/submit/history/${uid}/${qid}`)

export const getLeaderboard = () => api.get('/leaderboard/')

export default api
