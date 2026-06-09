"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Bell, Zap, MessageSquare, Calendar, Star, ShieldCheck, 
  CheckCircle2, X, ArrowRight 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Notification {
  id: number
  type: "match" | "request" | "request_sent" | "accepted" | "meeting" | "rating" | "verification"
  title: string
  message: string
  href: string
  read: boolean
  time: string
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "match",
    title: "New Match Found",
    message: "CloudVault Security is a 92% match with your intent profile.",
    href: "/matches",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    type: "request",
    title: "New Intro Request",
    message: "Acme Corp wants to connect — 96% match.",
    href: "/requests",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 3,
    type: "meeting",
    title: "Meeting Reminder",
    message: "DataStream Analytics call is tomorrow at 10:00 AM.",
    href: "/meetings",
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 4,
    type: "rating",
    title: "New Rating Received",
    message: "TechFlow Solutions gave you a 5.0 ⭐ rating.",
    href: "/ratings",
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 5,
    type: "verification",
    title: "Verification Update",
    message: "Your profile verification is under review.",
    href: "/profile",
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
]

const TYPE_ICON: Record<string, any> = {
  match: Zap,
  request: MessageSquare,
  request_sent: MessageSquare,
  accepted: CheckCircle2,
  meeting: Calendar,
  rating: Star,
  verification: ShieldCheck
}

const TYPE_COLOR: Record<string, string> = {
  match: "text-primary bg-primary/10",
  request: "text-blue-500 bg-blue-500/10",
  request_sent: "text-blue-500 bg-blue-500/10",
  accepted: "text-emerald-500 bg-emerald-500/10",
  meeting: "text-purple-500 bg-purple-500/10",
  rating: "text-amber-500 bg-amber-500/10",
  verification: "text-emerald-500 bg-emerald-500/10"
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `${days}d ago`
  if (hrs > 0) return `${hrs}h ago`
  if (mins > 0) return `${mins}m ago`
  return "Just now"
}

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS
  try {
    const stored = localStorage.getItem("taplyzer_notifications")
    if (!stored) {
      localStorage.setItem("taplyzer_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS))
      return DEFAULT_NOTIFICATIONS
    }
    return JSON.parse(stored)
  } catch {
    return DEFAULT_NOTIFICATIONS
  }
}

function saveNotifications(notifs: Notification[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("taplyzer_notifications", JSON.stringify(notifs))
  }
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  useEffect(() => {
    setNotifications(loadNotifications())
  }, [open]) // Refresh when opened

  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    saveNotifications(updated)
  }

  const handleClick = (notif: Notification) => {
    const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n)
    setNotifications(updated)
    saveNotifications(updated)
    setOpen(false)
    router.push(notif.href)
  }

  const dismiss = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    saveNotifications(updated)
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-slate-500 dark:text-white/40" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-12 w-[380px] max-w-[95vw] z-50 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                {unread > 0 && (
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5">
                    {unread} New
                  </Badge>
                )}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-8 w-8 text-slate-200 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No notifications</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const Icon = TYPE_ICON[notif.type] || Bell
                  const colorClass = TYPE_COLOR[notif.type] || "text-slate-500 bg-slate-100"
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleClick(notif)}
                      className={`flex items-start gap-4 px-5 py-4 cursor-pointer border-b border-slate-50 dark:border-white/[0.03] last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${!notif.read ? "bg-primary/[0.02] dark:bg-primary/[0.05]" : ""}`}
                    >
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-black leading-tight ${!notif.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-white/60"}`}>
                            {notif.title}
                          </p>
                          <button
                            onClick={(e) => dismiss(notif.id, e)}
                            className="p-0.5 rounded text-slate-300 dark:text-white/20 hover:text-slate-500 dark:hover:text-white/40 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 dark:text-white/30 mt-0.5 leading-snug">{notif.message}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20 mt-1.5">{timeAgo(notif.time)}</p>
                      </div>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-9 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 hover:bg-primary/5 flex items-center gap-1.5"
                onClick={() => { setOpen(false); router.push("/settings") }}
              >
                Notification Settings <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
