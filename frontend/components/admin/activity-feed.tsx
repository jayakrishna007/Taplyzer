"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  UserPlus, ShieldCheck, Send, Handshake, Calendar,
  CheckCircle2, Star, Flag, RefreshCw
} from "lucide-react"

type EventColor = "blue" | "emerald" | "amber" | "red" | "purple"

interface ActivityEvent {
  type: string
  actor: string
  target: string
  meta?: string
  time: string | Date
  color: EventColor
}

const eventConfig: Record<string, { label: string; icon: React.ElementType; color: EventColor }> = {
  USER_SIGNUP:              { label: "joined the platform", icon: UserPlus,      color: "blue" },
  VERIFICATION_SUBMITTED:   { label: "submitted for verification", icon: ShieldCheck, color: "amber" },
  BUSINESS_VERIFIED:        { label: "was verified ✓", icon: ShieldCheck,       color: "emerald" },
  REQUEST_SENT:             { label: "sent intro request to", icon: Send,         color: "purple" },
  REQUEST_ACCEPTED:         { label: "accepted request from", icon: Handshake,    color: "emerald" },
  MEETING_SCHEDULED:        { label: "scheduled meeting with", icon: Calendar,    color: "blue" },
  MEETING_COMPLETED:        { label: "completed meeting with", icon: CheckCircle2, color: "emerald" },
  RATING_SUBMITTED:         { label: "rated", icon: Star,           color: "amber" },
  USER_FLAGGED:             { label: "was flagged", icon: Flag,           color: "red" },
}

const dotColor: Record<EventColor, string> = {
  blue:    "bg-blue-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-500",
  red:     "bg-red-500",
  purple:  "bg-purple-500",
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AdminActivityFeed({ limit }: { limit?: number } = {}) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/activity-feed")
      const data = await res.json()
      if (data.events) {
        setEvents(data.events)
        setLastRefresh(new Date())
      }
    } catch (err) {
      console.error("Activity feed fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeed()
    // Poll every 30 seconds for real-time feel
    const interval = setInterval(fetchFeed, 30000)
    return () => clearInterval(interval)
  }, [fetchFeed])

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Live Activity
          </h3>
        </div>
        <button
          onClick={fetchFeed}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white/60 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          {timeAgo(lastRefresh)}
        </button>
      </div>

      {/* Feed */}
      <div className="divide-y divide-slate-100 dark:divide-white/[0.03] max-h-[500px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-3/4 bg-slate-100 dark:bg-white/5 rounded" />
                <div className="h-2.5 w-1/3 bg-slate-100 dark:bg-white/5 rounded" />
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 dark:text-white/30 text-sm font-bold">
            No recent activity
          </div>
        ) : (
          (limit ? events.slice(0, limit) : events).map((event, i) => {
            const config = eventConfig[event.type] || {
              label: event.type,
              icon: CheckCircle2,
              color: "blue" as EventColor,
            }
            const EventIcon = config.icon
            const color = event.color || config.color

            return (
              <div key={i} className="px-6 py-4 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                  color === "blue"    && "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
                  color === "emerald" && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500",
                  color === "amber"   && "bg-amber-50 dark:bg-amber-900/20 text-amber-500",
                  color === "red"     && "bg-red-50 dark:bg-red-900/20 text-red-500",
                  color === "purple"  && "bg-purple-50 dark:bg-purple-900/20 text-purple-500",
                )}>
                  <EventIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white/80 leading-snug">
                    <span className="text-slate-900 dark:text-white">{event.actor}</span>
                    {" "}{config.label}{" "}
                    {event.target !== "platform" && (
                      <span className="text-slate-900 dark:text-white">{event.target}</span>
                    )}
                    {event.meta && (
                      <span className="text-slate-500 dark:text-white/40"> · {event.meta}</span>
                    )}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-1">
                    {timeAgo(new Date(event.time))}
                  </p>
                </div>
                <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", dotColor[color] || "bg-slate-300")} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
