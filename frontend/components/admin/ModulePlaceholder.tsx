"use client"

import { cn } from "@/lib/utils"
import { ModuleStatus } from "@/config/adminModules"
import { Zap, Clock, Lock, FlaskConical } from "lucide-react"

interface ModulePlaceholderProps {
  title: string
  description?: string
  status: ModuleStatus
  className?: string
}

const config: Record<string, {
  icon: React.ElementType
  tagline: string
  note: string
  iconBg: string
  tagBg: string
  tagText: string
  glow: string
}> = {
  comingSoon: {
    icon: Clock,
    tagline: "Coming Soon",
    note: "Architecture is ready. Activation planned in a future phase.",
    iconBg: "bg-blue-500/10 text-blue-500",
    tagBg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/30",
    tagText: "text-blue-700 dark:text-blue-400",
    glow: "shadow-[0_0_60px_-10px_rgba(59,130,246,0.2)]",
  },
  beta: {
    icon: FlaskConical,
    tagline: "Beta — Collecting Data",
    note: "Collecting enough live network activity to generate meaningful intelligence.",
    iconBg: "bg-purple-500/10 text-purple-500",
    tagBg: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-900/30",
    tagText: "text-purple-700 dark:text-purple-400",
    glow: "shadow-[0_0_60px_-10px_rgba(168,85,247,0.2)]",
  },
  internal: {
    icon: Lock,
    tagline: "Internal Only",
    note: "This section is restricted to Super Admin access.",
    iconBg: "bg-slate-500/10 text-slate-500",
    tagBg: "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10",
    tagText: "text-slate-600 dark:text-white/40",
    glow: "",
  },
  limited: {
    icon: Zap,
    tagline: "Limited Mode",
    note: "Core functionality is active. Advanced features will be enabled in a future phase.",
    iconBg: "bg-amber-500/10 text-amber-500",
    tagBg: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/30",
    tagText: "text-amber-700 dark:text-amber-400",
    glow: "",
  },
}

export function ModulePlaceholder({ title, description, status, className }: ModulePlaceholderProps) {
  const c = config[status] || config.comingSoon
  const Icon = c.icon

  return (
    <div className={cn(
      "min-h-[60vh] flex items-center justify-center",
      className
    )}>
      <div className={cn(
        "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-3xl p-12 lg:p-16 max-w-lg w-full text-center",
        c.glow
      )}>
        {/* Icon */}
        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6", c.iconBg)}>
          <Icon className="h-8 w-8" />
        </div>

        {/* Status tag */}
        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest mb-5", c.tagBg, c.tagText)}>
          {status === "beta" && <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />}
          {c.tagline}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{title}</h2>

        {/* Description */}
        <p className="text-sm font-bold text-slate-500 dark:text-white/40 leading-relaxed">
          {description || c.note}
        </p>

        {/* Note */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-white/15">
            {status === "comingSoon" && "Architecture ready — activation planned"}
            {status === "beta" && "Live data collection in progress"}
            {status === "internal" && "Super Admin access required"}
            {status === "limited" && "Core features active"}
          </p>
        </div>
      </div>
    </div>
  )
}

// Inline badge for sidebar and table use
export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  if (status === "enabled") return null
  const map: Record<string, { label: string; cls: string }> = {
    beta:       { label: "Beta",         cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    limited:    { label: "Limited",      cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    comingSoon: { label: "Soon",         cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    internal:   { label: "Internal",     cls: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/30" },
    disabled:   { label: "Disabled",     cls: "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20" },
  }
  const m = map[status]
  if (!m) return null
  return (
    <span className={cn("ml-auto px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0", m.cls)}>
      {m.label}
    </span>
  )
}
