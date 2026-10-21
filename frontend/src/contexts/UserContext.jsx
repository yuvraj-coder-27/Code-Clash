import { createContext, useContext, useState, useEffect } from 'react'
import { getTeam } from '../api'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [team, setTeam] = useState(() => {
    try {
      const stored = localStorage.getItem('codeclash_team')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [currentMember, setCurrentMemberState] = useState(() => {
    return localStorage.getItem('codeclash_member') || ''
  })

  const setCurrentMember = (memberName) => {
    setCurrentMemberState(memberName)
    localStorage.setItem('codeclash_member', memberName)
  }

  const login = (teamData, memberName = '') => {
    setTeam(teamData)
    localStorage.setItem('codeclash_team', JSON.stringify(teamData))
    if (memberName) {
      setCurrentMember(memberName)
    } else {
      setCurrentMember(teamData.member1_name)
    }
  }

  const refreshTeam = async () => {
    if (!team?.id) return null
    try {
      const res = await getTeam(team.id)
      setTeam(res.data)
      localStorage.setItem('codeclash_team', JSON.stringify(res.data))
      return res.data
    } catch (err) {
      console.error('Failed to refresh team:', err)
      return null
    }
  }

  const logout = () => {
    setTeam(null)
    setCurrentMemberState('')
    localStorage.removeItem('codeclash_team')
    localStorage.removeItem('codeclash_member')
  }

  return (
    <UserContext.Provider value={{ team, user: team, currentMember, setCurrentMember, login, refreshTeam, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
