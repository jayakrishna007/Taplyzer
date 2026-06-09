"use client"

import { cn } from "@/lib/utils"

interface SectionCardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
  noPadding?: boolean
}

export function SectionCard({ title, subtitle, children, className, headerActions, noPadding }: SectionCardProps) {
  return (
    <div className={cn("bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden", className)}>
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerActions && <div className="shrink-0">{headerActions}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  )
}

// Mini skeleton loaders
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-5 rounded-lg bg-slate-100 dark:bg-white/5 mb-3" />
      <div className="h-7 w-16 bg-slate-100 dark:bg-white/5 rounded mb-2" />
      <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 rounded" />
    </div>
  )
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}
