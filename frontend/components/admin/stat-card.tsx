"use client"

import Link from "next/link"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  color?: "blue" | "emerald" | "amber" | "red" | "purple" | "primary"
  href?: string
  className?: string
}

const colorMap = {
  blue:    "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
  amber:   "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
  red:     "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30",
  purple:  "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
  primary: "bg-primary/10 text-primary border-primary/20",
}

export function StatCard({ label, value, sub, icon: Icon, trend, color = "primary", href, className }: StatCardProps) {
  const iconClass = colorMap[color]

  const card = (
    <div className={cn(
      "bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-6 flex flex-col gap-4 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-white/10 group",
      href && "cursor-pointer",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className={cn("h-11 w-11 rounded-xl border flex items-center justify-center shrink-0", iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full",
            trend === "up" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" :
            trend === "down" ? "text-red-500 bg-red-50 dark:bg-red-900/20" :
            "text-slate-400 bg-slate-50 dark:bg-white/5"
          )}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> :
             trend === "down" ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
          {value}
        </p>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-1.5">
          {label}
        </p>
        {sub && (
          <p className="text-xs font-bold text-slate-500 dark:text-white/40 mt-2 border-t border-slate-100 dark:border-white/5 pt-2">
            {sub}
          </p>
        )}
      </div>
    </div>
  )

  if (href) return <Link href={href}>{card}</Link>
  return card
}
