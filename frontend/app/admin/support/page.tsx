"use client"

import { useEffect, useState, useCallback } from "react"
import { HeadphonesIcon, Search, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { useAuth } from "@/components/auth-provider"

export default function AdminSupportPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/support?page=${page}&limit=20`)
      const data = await res.json()
      setTickets(data.tickets || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  async function updateTicket(ticketId: string, status: string) {
    setActionLoading(true)
    try {
      await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status, adminNotes, adminId: user?._id }),
      })
      setExpandedId(null)
      setAdminNotes("")
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setActionLoading(false) }
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Support & Tickets" subtitle="User issue resolution tracking." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tickets", value: stats?.total ?? "—", color: "text-blue-500" },
          { label: "Open", value: stats?.open ?? "—", color: "text-red-500" },
          { label: "In Progress", value: stats?.inProgress ?? "—", color: "text-amber-500" },
          { label: "Resolved", value: stats?.resolved ?? "—", color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                {["Ticket", "User", "Category", "Priority", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : tickets.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={HeadphonesIcon} title="No tickets" description="Support inbox is empty." /></td></tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80 max-w-[200px] truncate">{t.subject}</p>
                      <p className="text-[10px] font-mono text-slate-400">#{t._id.slice(-6)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{t.userName || "Unknown"}</p>
                      <p className="text-[11px] text-slate-400">{t.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-white/60">{t.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.priority} size="xs" /></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} size="xs" /></td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => { setExpandedId(expandedId === t._id ? null : t._id); setAdminNotes(t.adminNotes || "") }}
                        className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded border border-slate-200 dark:border-white/10 text-slate-600 hover:bg-slate-100">
                        {expandedId === t._id ? "Close" : "View"}
                      </button>
                      
                      {expandedId === t._id && (
                        <div className="absolute right-0 top-10 z-20 w-80 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-4">
                          <p className="text-sm font-black text-slate-900 dark:text-white mb-2">{t.subject}</p>
                          <p className="text-xs font-medium text-slate-600 dark:text-white/60 mb-4 whitespace-pre-wrap">{t.description}</p>
                          
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Admin Notes (Internal)</label>
                          <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none mb-3" />
                          
                          <div className="flex gap-2">
                            {t.status === "Open" && (
                              <button onClick={() => updateTicket(t._id, "In Progress")} disabled={actionLoading}
                                className="flex-1 py-1.5 text-[10px] font-black rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">
                                In Progress
                              </button>
                            )}
                            {t.status !== "Resolved" && t.status !== "Closed" && (
                              <button onClick={() => updateTicket(t._id, "Resolved")} disabled={actionLoading}
                                className="flex-1 py-1.5 text-[10px] font-black rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                                Resolve
                              </button>
                            )}
                            <button onClick={() => updateTicket(t._id, t.status)} disabled={actionLoading}
                              className="flex-1 py-1.5 text-[10px] font-black rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
