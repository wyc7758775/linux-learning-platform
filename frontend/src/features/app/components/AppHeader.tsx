import { AvatarPicker } from '../../../components/AvatarPicker/AvatarPicker'
import type { ActiveTab, AppUser } from '../types'

interface AppHeaderProps {
  activeTab: ActiveTab
  completedCount: number
  connected: boolean
  isDark: boolean
  levelsCount: number
  onSwitchTab: (tab: ActiveTab) => void
  user: AppUser | null
  wrongRecordCount: number
}

export function AppHeader({
  activeTab,
  completedCount,
  connected,
  isDark,
  levelsCount,
  onSwitchTab,
  user,
  wrongRecordCount,
}: AppHeaderProps) {
  return (
    <header className={`shrink-0 z-50 border-b backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
      <div className="px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/app-icon.svg" alt="Logo" className="w-8 h-8 shrink-0" />
            <div className={`relative isolate inline-grid grid-cols-2 items-center rounded-xl p-1 ${isDark ? 'bg-slate-800/90' : 'bg-slate-100'}`}>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out ${
                  isDark ? 'bg-slate-700 shadow-sm shadow-black/20' : 'bg-white shadow-sm shadow-slate-200/80'
                } ${activeTab === 'notebook' ? 'translate-x-full' : 'translate-x-0'}`}
              />
              <button
                onClick={() => onSwitchTab('learn')}
                className={`relative z-10 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'learn'
                    ? isDark ? 'text-white' : 'text-slate-900'
                    : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                学习
              </button>
              <button
                onClick={() => onSwitchTab('notebook')}
                className={`relative z-10 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'notebook'
                    ? isDark ? 'text-white' : 'text-slate-900'
                    : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                错题本
                {wrongRecordCount > 0 && (
                  <span className={`min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    activeTab === 'notebook'
                      ? 'bg-red-500 text-white'
                      : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-500'
                  }`}>
                    {wrongRecordCount > 99 ? '99+' : wrongRecordCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{completedCount}/{levelsCount}</span>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
              connected
                ? isDark ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' : 'bg-green-50 text-green-600 ring-1 ring-green-200'
                : isDark ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : 'bg-red-50 text-red-600 ring-1 ring-red-200'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="hidden sm:inline">{connected ? '已连接' : '离线'}</span>
            </div>

            {user && (
              <div className="flex items-center">
                <AvatarPicker currentAvatar={user.avatar} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
