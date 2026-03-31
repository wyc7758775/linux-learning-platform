import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { authApi } from '../services/api'
import Toast from '../components/Toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needCaptcha, setNeedCaptcha] = useState(false)
  const [captchaSvg, setCaptchaSvg] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const { login } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const loadCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha()
      setCaptchaSvg(res.data.svg)
      setCaptchaId(res.data.captchaId)
    } catch {
      setError('获取验证码失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(username, password, needCaptcha ? captchaId : undefined, needCaptcha ? captchaCode : undefined)
      navigate('/')
    } catch (err: any) {
      const data = err.response?.data
      if (data?.needCaptcha) {
        setNeedCaptcha(true)
        await loadCaptcha()
      }
      setError(data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Toast message={error} onDismiss={() => setError('')} />
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
            Linux 命令行学习平台
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            登录你的账号，继续学习之旅
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="支持中文、英文、数字、下划线"
              required
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
              placeholder="输入密码"
              required
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-green-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
              }`}
            />
          </div>

          {needCaptcha && captchaSvg && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                验证码
              </label>
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg border overflow-hidden cursor-pointer ${
                    isDark ? 'border-slate-600' : 'border-slate-300'
                  }`}
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                  onClick={loadCaptcha}
                  title="点击刷新验证码"
                />
                <input
                  type="text"
                  value={captchaCode}
                  onChange={e => setCaptchaCode(e.target.value)}
                  placeholder="输入验证码"
                  required
                  className={`flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-green-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
                  }`}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          还没有账号？{' '}
          <Link to="/register" className="text-green-500 hover:text-green-400 font-medium">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
