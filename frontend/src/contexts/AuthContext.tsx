import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, userApi } from '../services/api'

interface User {
  id: number
  username: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string, captchaId?: string, captchaCode?: string) => Promise<any>
  register: (username: string, password: string) => Promise<any>
  logout: () => void
  updateAvatar: (avatar: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('linux-learning-user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  // On mount, verify token is still valid
  useEffect(() => {
    const token = localStorage.getItem('linux-learning-token')
    if (token && user) {
      userApi.getProfile().then(res => {
        setUser(res.data)
        localStorage.setItem('linux-learning-user', JSON.stringify(res.data))
      }).catch(() => {
        // Token invalid, clear
        localStorage.removeItem('linux-learning-token')
        localStorage.removeItem('linux-learning-user')
        setUser(null)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string, captchaId?: string, captchaCode?: string) => {
    const res = await authApi.login(username, password, captchaId, captchaCode)
    const { token, user: userData } = res.data
    localStorage.setItem('linux-learning-token', token)
    localStorage.setItem('linux-learning-user', JSON.stringify(userData))
    setUser(userData)

    // Migrate localStorage progress on first login
    try {
      const savedProgress = localStorage.getItem('linux-learning-progress')
      if (savedProgress) {
        const { completedLevels } = JSON.parse(savedProgress)
        if (completedLevels?.length > 0) {
          await userApi.migrateProgress(completedLevels)
        }
      }
    } catch {
      // Migration failure is non-critical
    }

    return res.data
  }

  const register = async (username: string, password: string) => {
    const res = await authApi.register(username, password)
    const { token, user: userData } = res.data
    localStorage.setItem('linux-learning-token', token)
    localStorage.setItem('linux-learning-user', JSON.stringify(userData))
    setUser(userData)

    // Migrate localStorage progress on first register
    try {
      const savedProgress = localStorage.getItem('linux-learning-progress')
      if (savedProgress) {
        const { completedLevels } = JSON.parse(savedProgress)
        if (completedLevels?.length > 0) {
          await userApi.migrateProgress(completedLevels)
        }
      }
    } catch {
      // Migration failure is non-critical
    }

    return res.data
  }

  const logout = () => {
    localStorage.removeItem('linux-learning-token')
    localStorage.removeItem('linux-learning-user')
    setUser(null)
  }

  const updateAvatar = (avatar: string) => {
    if (user) {
      const updated = { ...user, avatar }
      setUser(updated)
      localStorage.setItem('linux-learning-user', JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
