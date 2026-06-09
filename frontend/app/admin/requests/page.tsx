"use client"

import { useEffect, useState, useCallback } from "react"
import { Handshake, MessageSquare, ChevronLeft, ChevronRight, Search, AlertTriangle } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"

interface RequestItem {
  _id: string
  senderId: { name: string; email: string } | null
  receiverId: { name: string; email: string } | null
  status: string
  dealType?: string
  message?: string
  createdAt: string
  updatedAt: string
}

const statusTabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
]

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [stats, setStats] = useState<any>(null)
  const [spamCandidates, setSpamCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/admin/requests?${params}`)
      const data = await res.json()
      setRequests(data.requests || [])
      setStats(data.stats)
      setSpamCandidates(data.spamCandidates || [])
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Requests" subtitle="Monitor all intro requests — track interaction quality and detect spam." />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats?.total ?? "—", color: "text-slate-500" },
          { label: "Pending", value: stats?.pending ?? "—", color: "text-amber-500" },
          { label: "Accepted", value: stats?.accepted ?? "—", color: "text-emerald-500" },
          { label: "Rejected", value: stats?.rejected ?? "—", color: "text-red-500" },
          { label: "Expired", value: stats?.expired ?? "—", color: "text-slate-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Spam Detection Panel */}
      {spamCandidates.length > 0 && (
        <SectionCard title="⚠ Spam Detection" subtitle="High-volume senders with <20% acceptance rate">
          <div className="space-y-2">
            {spamCandidates.map((c: any) => (
              <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">{c.user?.name || "Unknown"} <span className="font-normal text-red-400">({c.user?.email})</span></p>
                  <p className="text-[11px] text-red-400 mt-0.5">{c.total} requests sent · {Math.round(c.acceptanceRate * 100)}% acceptance rate</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Status Tabs */}
      <div className="flex gap-1 flex-wrap">
        {statusTabs.map((t) => (
          <button key={t.value} onClick={() => { setStatusFilter(t.value); setPage(1) }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${statusFilter === t.value ? "bg-red-600 text-white" : "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                {["Sender", "Receiver", "Deal Type", "Status", "Sent", "Response Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : requests.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={MessageSquare} title="No requests found" description="Requests will appear as users interact." /></td></tr>
              ) : (
                requests.map((r) => {
                  const responseTime = r.status !== "pending"
                    ? Math.floor((new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60))
                    : null
                  return (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800 dark:text-white/80">{r.senderId?.name || "—"}</p>
                        <p className="text-[11px] text-slate-400">{r.senderId?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800 dark:text-white/80">{r.receiverId?.name || "—"}</p>
                        <p className="text-[11px] text-slate-400">{r.receiverId?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-white/40">{r.dealType || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} size="xs" />
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-400">
                        {responseTime !== null ? `${responseTime}h` : "—"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/5">
            <p className="text-xs font-bold text-slate-400">Page {page} of {pages} ({total})</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40">
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
