"use client"

import { cn } from "@/lib/utils"

type StatusVariant =
  | "enabled" | "limited" | "beta" | "internal" | "comingSoon" | "disabled"
  | "open" | "closed" | "pending" | "active" | "suspended" | "resolved" | "dismissed"
  | "underReview" | "approved" | "rejected" | "scheduled" | "completed" | "cancelled"
  | "free" | "pro" | "enterprise" | "critical" | "high" | "medium" | "low"
  | "inProgress" | "noOutcome"

const variants: Record<string, string> = {
  // Module statuses
  enabled:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  limited:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  beta:        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  internal:    "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/40",
  comingSoon:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  disabled:    "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20",
  // User/entity statuses
  active:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  suspended:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  pending:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  open:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  closed:      "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/30",
  resolved:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  dismissed:   "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/30",
  underReview: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  scheduled:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled:   "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  inProgress:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  noOutcome:   "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/30",
  // Plans
  free:        "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/50",
  pro:         "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  enterprise:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  // Severity
  critical:    "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  high:        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium:      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low:         "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/30",
}

const labels: Record<string, string> = {
  comingSoon:  "Coming Soon",
  underReview: "Under Review",
  inProgress:  "In Progress",
  noOutcome:   "No Outcome",
}

interface StatusBadgeProps {
  status: string
  className?: string
  size?: "xs" | "sm"
}

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full font-black uppercase tracking-widest whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20",
        className
      )}>
        Unknown
      </span>
    )
  }
  const key = status.toLowerCase().replace(/[\s_]/g, "").replace("comingsoon", "comingSoon").replace("underreview", "underReview").replace("inprogress", "inProgress").replace("nooutcome", "noOutcome")
  const style = variants[key] || variants[key.toLowerCase()] || "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/30"
  const label = labels[key] || status

  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-black uppercase tracking-widest whitespace-nowrap",
      size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
      style,
      className
    )}>
      {label}
    </span>
  )
}
