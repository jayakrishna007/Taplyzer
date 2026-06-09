"use client"

import { useEffect, useState, useCallback } from "react"
import { Flag as FlagIcon, CheckCircle2, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { useAuth } from "@/components/auth-provider"

export default function AdminFlagsPage() {
  const { user } = useAuth()
  const [flags, setFlags] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/flags?page=${page}&limit=20`)
      const data = await res.json()
      setFlags(data.flags || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  async function resolveFlag(flagId: string) {
    try {
      await fetch("/api/admin/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId, status: "Resolved", adminNotes: "Resolved via dashboard", adminId: user?._id }),
      })
      await fetchData()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Reports & Flags" subtitle="Marketplace safety enforcement center." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open (Urgent)", value: stats?.open ?? "—", color: "text-red-500" },
          { label: "Under Review", value: stats?.underReview ?? "—", color: "text-amber-500" },
          { label: "Resolved Today", value: stats?.resolvedToday ?? "—", color: "text-emerald-500" },
          { label: "Total Reports", value: stats?.total ?? "—", color: "text-blue-500" },
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
                {["Severity", "Reporter", "Reported", "Reason", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : flags.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={ShieldAlert} title="Inbox Zero" description="No safety reports at this time." /></td></tr>
              ) : (
                flags.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <StatusBadge status={f.severity || "medium"} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{f.reporterId?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">{f.reportedUserId?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-white/60">{f.reason}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{f.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={f.status} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-400">
                      {new Date(f.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {f.status !== "Resolved" && f.status !== "Dismissed" && (
                        <button onClick={() => resolveFlag(f._id)} className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors">
                          <CheckCircle2 className="h-3 w-3" /> Resolve
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
            <p className="text-xs font-bold text-slate-400">Page {page} of {pages}</p>
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
