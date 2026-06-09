"use client"

import { useEffect, useState, useCallback } from "react"
import { Target, Search, Target as TargetIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { useAuth } from "@/components/auth-provider"

interface Business {
  _id: string
  name: string
  industry: string
  userId: { name: string; email: string }
  offerings: string[]
  needs: string[]
  goal: string
  profileScore: number
  updatedAt: string
}

export default function AdminProfilesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/profiles?${params}`)
      const data = await res.json()
      setBusinesses(data.profiles || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Profiles & Intent" subtitle="Monitor intent quality. High-quality intent data is the fuel for match quality." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Businesses", value: stats?.total ?? "—", color: "text-blue-500" },
          { label: "High Quality (≥80)", value: stats?.highQuality ?? "—", color: "text-emerald-500" },
          { label: "Stale (>30d)", value: stats?.stale ?? "—", color: "text-amber-500" },
          { label: "Needs Improvement", value: stats?.needsImprovement ?? "—", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search businesses or intent…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                {["Business", "Goal", "Offerings", "Needs", "Score", "Last Updated"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : businesses.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={TargetIcon} title="No intent data" description="Try adjusting your filters." /></td></tr>
              ) : (
                businesses.map((b) => {
                  const daysOld = Math.floor((Date.now() - new Date(b.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800 dark:text-white/80">{b.name || "—"}</p>
                        <p className="text-[11px] text-slate-400">{b.industry}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-white/40">{b.goal || "Not set"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {b.offerings?.slice(0, 2).map((o, i) => (
                            <span key={i} className="text-[9px] font-bold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{o}</span>
                          ))}
                          {(b.offerings?.length || 0) > 2 && <span className="text-[9px] font-bold text-slate-500">+{b.offerings.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {b.needs?.slice(0, 2).map((n, i) => (
                            <span key={i} className="text-[9px] font-bold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{n}</span>
                          ))}
                          {(b.needs?.length || 0) > 2 && <span className="text-[9px] font-bold text-slate-500">+{b.needs.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${b.profileScore >= 80 ? "bg-emerald-500" : b.profileScore >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${b.profileScore}%` }} />
                          </div>
                          <span className="text-[10px] font-black">{b.profileScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{new Date(b.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                          {daysOld > 30 && <span title="Stale intent (>30d)"><AlertCircle className="h-3 w-3 text-amber-500" /></span>}
                        </div>
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
