"use client"

import { useState, useEffect } from "react"
import { Bell, Send, CheckCircle2, History } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { useAuth } from "@/components/auth-provider"

export default function AdminNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState("all")
  const [type, setType] = useState("announcement")
  const [sending, setSending] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/notifications")
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) return
    setSending(true)
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, audience, type, adminId: user?._id }),
      })
      setTitle(""); setMessage("")
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Notifications" subtitle="Platform communication center — broadcast to users." />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose Panel */}
        <div className="lg:col-span-2">
          <SectionCard title="Compose Broadcast" subtitle="Send an in-app notification">
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., New Feature Update"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Message</label>
                <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification body..." rows={4}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
                <p className={`text-[10px] font-bold mt-1 text-right ${message.length > 200 ? "text-red-500" : "text-slate-400"}`}>
                  {message.length} / 200
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Audience</label>
                  <select value={audience} onChange={e => setAudience(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option value="all">All Users</option>
                    <option value="verified">Verified Only</option>
                    <option value="pro">PRO Users</option>
                    <option value="free">Free Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option value="announcement">Announcement</option>
                    <option value="alert">System Alert</option>
                    <option value="feature">Feature Update</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={sending || !title || !message}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-all disabled:opacity-50">
                <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send Broadcast"}
              </button>
            </form>
          </SectionCard>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-3">
          <SectionCard title="Broadcast History" subtitle="Recently sent notifications" noPadding>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-slate-50 dark:bg-white/2 animate-pulse" />)
              ) : notifications.length === 0 ? (
                <EmptyState icon={History} title="No broadcasts sent" description="Your sent notifications will appear here." size="sm" />
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{n.title}</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-white/60 mb-2">{n.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                        {n.audience}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40 px-1.5 py-0.5 rounded">
                        {n.type}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Sent by {n.senderAdminId?.name || "Admin"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
