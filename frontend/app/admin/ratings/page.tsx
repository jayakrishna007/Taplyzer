"use client"

import { useEffect, useState, useCallback } from "react"
import { Star, ShieldAlert, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/ratings?page=${page}&limit=20`)
      const data = await res.json()
      setRatings(data.ratings || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Ratings & Feedback" subtitle="Business reputation management and abuse detection." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Rating", value: stats?.avgRating ? stats.avgRating.toFixed(1) : "—", color: "text-amber-500" },
          { label: "Total Reviews", value: stats?.total ?? "—", color: "text-blue-500" },
          { label: "High (4-5★)", value: stats?.high ?? "—", color: "text-emerald-500" },
          { label: "Low (1-2★)", value: stats?.low ?? "—", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <div className="flex items-center gap-1">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              {s.label === "Avg Rating" && <Star className={`h-4 w-4 ${s.color} fill-current`} />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {stats?.abuseCandidates?.length > 0 && (
        <SectionCard title="Abuse Detection" subtitle="Users who frequently give low ratings (1-2★)">
          <div className="space-y-2">
            {stats.abuseCandidates.map((c: any) => (
              <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">{c.user?.name || "Unknown"} <span className="font-normal text-red-400">({c.user?.email})</span></p>
                  <p className="text-[11px] text-red-400 mt-0.5">{c.totalLowRatings} low ratings given recently</p>
                </div>
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                {["From", "To", "Rating", "Feedback Tags", "Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : ratings.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Star} title="No ratings found" description="Feedback will appear after meetings complete." /></td></tr>
              ) : (
                ratings.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{r.reviewerId?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{r.targetId?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "text-amber-500 fill-amber-500" : "text-slate-200 dark:text-white/10"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {r.tags?.map((tag: string, i: number) => (
                          <span key={i} className="text-[9px] font-bold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.isFlagged ? "suspended" : "active"} size="xs" />
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
