import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: BASE_URL })

// Team Auth
export const registerTeam       = (data) => api.post('/teams/register', data)
export const loginTeam          = (data) => api.post('/teams/login', data)
export const getTeam            = (id)   => api.get(`/teams/${id}`)
export const listTeams          = ()     => api.get('/teams/')
export const claimRound         = (data) => api.post('/teams/claim-round', data)

// Questions
export const getQuestions       = (round) => api.get(`/questions/round/${round}`)
export const getQuestion        = (id)    => api.get(`/questions/${id}`)

// Submissions
export const submitMCQ          = (data) => api.post('/submit/mcq', data)
export const submitDebugging    = (data) => api.post('/submit/debugging', data)
export const getTeamSubmissions = (teamId) => api.get(`/submit/team/${teamId}`)

// Leaderboard
export const getLeaderboard     = () => api.get('/leaderboard/')

export default api
