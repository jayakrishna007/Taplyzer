"use client"

import { useEffect, useState, useCallback } from "react"
import { CreditCard, Search, ShieldAlert, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/subscriptions?page=${page}&limit=20`)
      const data = await res.json()
      setSubs(data.subscriptions || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Subscriptions" subtitle="Revenue and plan distribution management." />

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 flex items-start gap-3">
        <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-amber-700 dark:text-amber-400">Billing Integrations</p>
          <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/60 mt-0.5">
            Automated billing via Razorpay/Stripe is planned for a future phase. Manual plan management is active.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Active Subs", value: stats?.totalActive ?? "—", color: "text-emerald-500" },
          { label: "PRO", value: stats?.proCount ?? "—", color: "text-purple-500" },
          { label: "ENTERPRISE", value: stats?.enterpriseCount ?? "—", color: "text-blue-500" },
          { label: "FREE", value: stats?.freeCount ?? "—", color: "text-slate-500" },
          { label: "Expiring Soon", value: stats?.expiringSoon ?? "—", color: "text-amber-500" },
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
                {["User", "Plan", "Status", "Start Date", "End Date", "Days Remaining"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : subs.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={CreditCard} title="No subscriptions found" /></td></tr>
              ) : (
                subs.map((s) => {
                  const remaining = s.endDate ? Math.floor((new Date(s.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                  return (
                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800 dark:text-white/80">{s.userId?.name || "—"}</p>
                        <p className="text-[11px] text-slate-400">{s.userId?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.plan?.toLowerCase() || "free"} size="xs" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} size="xs" />
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-400">
                        {new Date(s.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-400">
                        {s.endDate ? new Date(s.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Lifetime"}
                      </td>
                      <td className="px-4 py-3">
                        {remaining !== null ? (
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            remaining < 7 ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
                            : remaining < 30 ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
                            : "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
                          }`}>{remaining} days</span>
                        ) : "—"}
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
