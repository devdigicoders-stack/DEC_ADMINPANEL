import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService.js'

export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      const token = localStorage.getItem('dec_admin_token')
      if (!token) {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      try {
        // Authenticate with backend using stored JWT Bearer token
        const freshUser = await authService.getProfile()
        if (isMounted) {
          if (freshUser) {
            setUser(freshUser)
          } else {
            authService.logout()
            setUser(null)
          }
        }
      } catch (err) {
        // Token is invalid, expired, or user account was deactivated/deleted
        if (isMounted) {
          authService.logout()
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    if (res?.user) {
      setUser(res.user)
    }
    return res
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
