import { ErrorAnalysisCard } from './ErrorAnalysisCard'
import type { WrongRecord } from '../types'

interface NotebookDetailContentProps {
  isDark: boolean
  record: WrongRecord
}

export function NotebookDetailContent({ isDark, record }: NotebookDetailContentProps) {
  return (
    <div className="flex-1 px-6 py-6 space-y-5">
      <div>
        <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>执行命令</div>
        <div className={`rounded-xl px-5 py-4 font-mono text-sm ${isDark ? 'bg-slate-800/80 text-amber-400 ring-1 ring-slate-700/50' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50'}`}>
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>$ </span>
          {record.detail?.command || '(空)'}
        </div>
      </div>

      {record.detail?.output && (
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>输出结果</div>
          <div className={`rounded-xl px-5 py-4 font-mono text-sm whitespace-pre-wrap break-all max-h-48 overflow-y-auto ${
            isDark ? 'bg-slate-800/80 text-red-400 ring-1 ring-slate-700/50' : 'bg-red-50 text-red-600 ring-1 ring-red-200/50'
          }`}>
            {record.detail.output}
          </div>
        </div>
      )}

      {record.detail?.hint && (
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>正确提示</div>
          <div className={`rounded-xl px-5 py-4 text-sm ${isDark ? 'bg-emerald-500/5 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50'}`}>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{record.detail.hint}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>错误分析</div>
        <div className={`rounded-xl px-5 py-4 text-sm ${isDark ? 'bg-slate-800/50 ring-1 ring-slate-700/50' : 'bg-white ring-1 ring-slate-200'}`}>
          <ErrorAnalysisCard isDark={isDark} record={record} />
        </div>
      </div>
    </div>
  )
}
