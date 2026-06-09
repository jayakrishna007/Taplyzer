"use client"

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EmptyState({ icon: Icon, title, description, action, className, size = "md" }: EmptyStateProps) {
  const sizeMap = {
    sm: { wrap: "py-10", icon: "h-8 w-8 mb-3", title: "text-sm", desc: "text-xs" },
    md: { wrap: "py-16", icon: "h-10 w-10 mb-4", title: "text-base", desc: "text-sm" },
    lg: { wrap: "py-24", icon: "h-12 w-12 mb-5", title: "text-lg", desc: "text-sm" },
  }
  const s = sizeMap[size]

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", s.wrap, className)}>
      {Icon && (
        <div className="mb-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto">
            <Icon className={cn(s.icon, "text-slate-300 dark:text-white/15")} />
          </div>
        </div>
      )}
      <p className={cn("font-black text-slate-600 dark:text-white/50", s.title)}>{title}</p>
      {description && (
        <p className={cn("text-slate-400 dark:text-white/25 font-medium mt-1.5 max-w-sm", s.desc)}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
