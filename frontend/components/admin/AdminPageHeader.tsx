"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  live?: boolean
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  backHref?: string
  backLabel?: string
}

export function AdminPageHeader({
  title, subtitle, live, badge, actions, className, backHref, backLabel
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        {backHref && (
          <Link href={backHref} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors mb-2">
            ← {backLabel || "Back"}
          </Link>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {live && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Live</span>
            </span>
          )}
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm font-bold text-slate-500 dark:text-white/40">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
