import { createContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext(null)

const TOKEN_KEY = 'career_ai_token'
const USER_KEY  = 'career_ai_user'

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load persisted auth state on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUser  = localStorage.getItem(USER_KEY)
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch {
      // Ignore malformed stored data
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback((tokenValue, userData) => {
    setToken(tokenValue)
    setUser(userData)
    localStorage.setItem(TOKEN_KEY, tokenValue)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const updateUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
