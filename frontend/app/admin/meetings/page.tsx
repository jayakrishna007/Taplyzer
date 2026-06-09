"use client"

import { useEffect, useState, useCallback } from "react"
import { Calendar, ChevronLeft, ChevronRight, Video, XCircle, ExternalLink, Crown } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { useAuth } from "@/components/auth-provider"

interface MeetingItem {
  _id: string
  organizerId: { name: string; email: string }
  attendeeId: { name: string; email: string }
  startTime: string
  endTime: string
  status: string
  outcome: string
  meetLink?: string
  hostMeetLink?: string
  provider?: string
  createdAt: string
}

export default function AdminMeetingsPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<MeetingItem[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/admin/meetings?${params}`)
      const data = await res.json()
      setMeetings(data.meetings || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  async function updateOutcome(meetingId: string, outcome: string) {
    try {
      await fetch("/api/admin/meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, action: "UPDATE_OUTCOME", payload: { outcome }, adminId: user?._id }),
      })
      await fetchData()
    } catch (e) { console.error(e) }
  }

  async function cancelMeeting(meetingId: string) {
    if (!confirm("Cancel this meeting?")) return
    setActionLoading(meetingId)
    try {
      await fetch("/api/admin/meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, action: "CANCEL", adminId: user?._id }),
      })
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  // Completion rate gauge
  const completionRate = stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const gaugeColor = completionRate >= 70 ? "#10b981" : completionRate >= 40 ? "#f59e0b" : "#ef4444"
  const circumference = Math.PI * 40
  const filled = (completionRate / 100) * circumference

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Meeting Intelligence" subtitle="Track real business interactions — meeting = proof of intent quality." />

      {/* Stats Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats?.total ?? "—", color: "text-blue-500" },
          { label: "Scheduled", value: stats?.scheduled ?? "—", color: "text-purple-500" },
          { label: "Completed", value: stats?.completed ?? "—", color: "text-emerald-500" },
          { label: "Cancelled", value: stats?.cancelled ?? "—", color: "text-red-500" },
          { label: "Via Whereby", value: stats?.wherebyCount ?? "—", color: "text-indigo-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Completion gauge + Whereby badge */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center gap-4 justify-center">
          <div className="relative shrink-0">
            <svg width="80" height="40" viewBox="0 0 100 50">
              <path d="M10,40 A40,40 0 0,1 90,40" fill="none" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="8" strokeLinecap="round" />
              <path d="M10,40 A40,40 0 0,1 90,40" fill="none" stroke={gaugeColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${filled} ${circumference}`} />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-0">
              <span className="text-lg font-black text-slate-900 dark:text-white">{completionRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completion</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Rate</p>
          </div>
        </div>

        {/* Whereby badge card */}
        <div className="lg:col-span-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Video className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              Whereby Video Provider Active
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-500 text-white rounded-full">Live</span>
            </p>
            <p className="text-xs text-indigo-500/70 dark:text-indigo-400/60 mt-0.5">
              {stats?.wherebyCount ?? 0} meeting rooms created • 40-min limit per session • Host + Attendee links stored
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 flex-wrap">
        {[{ label: "All", value: "" }, { label: "Scheduled", value: "scheduled" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }].map((t) => (
          <button key={t.value} onClick={() => { setStatusFilter(t.value); setPage(1) }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${statusFilter === t.value ? "bg-indigo-600 text-white" : "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                {["Organizer", "Attendee", "Date/Time", "Provider", "Status", "Outcome", "Room Links", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              ) : meetings.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={Calendar} title="No meetings found" description="Adjust your filters." /></td></tr>
              ) : (
                meetings.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{m.organizerId?.name || "—"}</p>
                      <p className="text-[10px] text-slate-400">{m.organizerId?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{m.attendeeId?.name || "—"}</p>
                      <p className="text-[10px] text-slate-400">{m.attendeeId?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {new Date(m.startTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(m.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        {" → "}
                        {new Date(m.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    {/* Provider badge */}
                    <td className="px-4 py-3">
                      {m.provider === "whereby" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                          <Video className="h-2.5 w-2.5" /> Whereby
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={m.outcome || "pending"}
                        onChange={(e) => updateOutcome(m._id, e.target.value)}
                        disabled={m.status?.toLowerCase() !== "completed"}
                        className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-600 disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="deal">Deal</option>
                        <option value="partnership">Partnership</option>
                        <option value="vendor">Vendor</option>
                        <option value="client">Client</option>
                        <option value="no_deal">No Deal</option>
                        <option value="follow_up">Follow Up</option>
                      </select>
                    </td>
                    {/* Whereby room links — host + attendee */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {m.hostMeetLink && (
                          <a href={m.hostMeetLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline">
                            <Crown className="h-3 w-3" /> Host
                          </a>
                        )}
                        {m.meetLink && (
                          <a href={m.meetLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Attendee
                          </a>
                        )}
                        {!m.meetLink && !m.hostMeetLink && (
                          <span className="text-[10px] text-slate-400">No link</span>
                        )}
                      </div>
                    </td>
                    {/* Cancel action */}
                    <td className="px-4 py-3">
                      {m.status?.toLowerCase() === "scheduled" && (
                        <button
                          onClick={() => cancelMeeting(m._id)}
                          disabled={actionLoading === m._id}
                          className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/5">
            <p className="text-xs font-bold text-slate-400">Page {page} of {pages} ({total} total)</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
