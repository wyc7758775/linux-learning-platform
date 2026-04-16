import { classifyError } from '../../../utils/classifyError'
import { errorTypeStyles } from '../constants'
import type { WrongRecord } from '../types'

interface ErrorAnalysisCardProps {
  isDark: boolean
  record: WrongRecord
}

export function ErrorAnalysisCard({ isDark, record }: ErrorAnalysisCardProps) {
  const analysis = classifyError(record.detail?.command || '', record.detail?.output || '', record.errorType)
  const style = errorTypeStyles[analysis.type]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? `${style.darkBg} ${style.darkText}` : `${style.bg} ${style.text}`}`}>
          {analysis.label}
        </span>
      </div>
      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{analysis.description}</p>

      <div>
        <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>改进建议</div>
        <ul className="space-y-2">
          {analysis.advice.map((item) => (
            <li key={item} className={`text-sm flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>相关命令</div>
        <div className="flex flex-wrap gap-2">
          {analysis.relatedCommands.map((command) => (
            <code key={command} className={`px-2 py-1 rounded-lg text-xs font-mono ${
              isDark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-700/60' : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
            }`}>
              {command}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}
