import type { ErrorType } from '../../utils/classifyError'

export interface TagColors {
  bg: string
  text: string
  darkBg: string
  darkText: string
}

export const chapterNames: Record<number, string> = {
  1: '基础命令',
  2: '权限实战',
  3: '事故响应',
  4: '部署上线',
  5: 'DevOps 实战',
  6: '脚本编程',
  7: '网络排查',
}

export const chapterColors: Record<number, TagColors> = {
  1: { bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'bg-blue-500/10', darkText: 'text-blue-400' },
  2: { bg: 'bg-amber-50', text: 'text-amber-600', darkBg: 'bg-amber-500/10', darkText: 'text-amber-400' },
  3: { bg: 'bg-red-50', text: 'text-red-600', darkBg: 'bg-red-500/10', darkText: 'text-red-400' },
  4: { bg: 'bg-purple-50', text: 'text-purple-600', darkBg: 'bg-purple-500/10', darkText: 'text-purple-400' },
  5: { bg: 'bg-emerald-50', text: 'text-emerald-600', darkBg: 'bg-emerald-500/10', darkText: 'text-emerald-400' },
  6: { bg: 'bg-cyan-50', text: 'text-cyan-600', darkBg: 'bg-cyan-500/10', darkText: 'text-cyan-400' },
  7: { bg: 'bg-pink-50', text: 'text-pink-600', darkBg: 'bg-pink-500/10', darkText: 'text-pink-400' },
}

export const errorTypeStyles: Record<ErrorType, TagColors> = {
  permission: { bg: 'bg-orange-50', text: 'text-orange-600', darkBg: 'bg-orange-500/10', darkText: 'text-orange-400' },
  notfound: { bg: 'bg-red-50', text: 'text-red-600', darkBg: 'bg-red-500/10', darkText: 'text-red-400' },
  syntax: { bg: 'bg-purple-50', text: 'text-purple-600', darkBg: 'bg-purple-500/10', darkText: 'text-purple-400' },
  command: { bg: 'bg-amber-50', text: 'text-amber-600', darkBg: 'bg-amber-500/10', darkText: 'text-amber-400' },
  empty: { bg: 'bg-slate-50', text: 'text-slate-600', darkBg: 'bg-slate-500/10', darkText: 'text-slate-400' },
  logic: { bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'bg-blue-500/10', darkText: 'text-blue-400' },
}

export function getDefaultTagColors(): TagColors {
  return {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    darkBg: 'bg-slate-500/10',
    darkText: 'text-slate-400',
  }
}
