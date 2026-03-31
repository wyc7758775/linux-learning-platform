import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      setVisible(false)
      return
    }
    // 触发进入动画
    const showTimer = setTimeout(() => setVisible(true), 10)
    // 3 秒后自动消失
    const hideTimer = setTimeout(() => {
      setVisible(false)
      // 等退出动画完成后再清除状态
      setTimeout(onDismiss, 300)
    }, 3000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
    }`}>
      <div className="px-5 py-3 rounded-xl text-sm font-medium text-white bg-red-500 shadow-lg shadow-red-500/25 flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        {message}
      </div>
    </div>
  )
}
