import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      await register(username, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`w-full max-w-md rounded-2xl border p-8 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      } shadow-xl`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-green-600 to-emerald-700'
          } shadow-lg shadow-green-500/25 mb-4`}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            创建新账号
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            开始你的 Linux 学习之旅
          </p>
        </div>

        {error && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="2-20 字符，支持中文、英文、数字、下划线"
              required
              minLength={2}
              maxLength={20}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-green-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少8位，需包含大写字母和特殊符号"
              required
              minLength={8}
              maxLength={64}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-green-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
              }`}
            />
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              密码需包含至少一个大写字母和一个特殊符号（如 !@#$% 等）
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              required
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-green-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          已有账号？{' '}
          <Link to="/login" className="text-green-500 hover:text-green-400 font-medium">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
