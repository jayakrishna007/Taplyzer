"use client"

import { useEffect, useState, useCallback } from "react"
import { Handshake, Search, AlertTriangle, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"

interface MatchRecord {
  _id: string
  userId: { name: string; email: string }
  matchedUserId: { name: string; email: string }
  score: number
  reasons: string[]
  outcome: string
  createdAt: string
  updatedAt: string
}

const chartTheme = {
  tooltip: {
    contentStyle: { background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" },
    labelStyle: { fontWeight: 800, color: "#fff" },
  },
  text: { fill: "rgba(148,163,184,0.8)", fontSize: 11, fontWeight: 700 },
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      if (outcomeFilter) params.set("outcome", outcomeFilter)
      const res = await fetch(`/api/admin/matches?${params}`)
      const data = await res.json()
      setMatches(data.matches || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, outcomeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const bucketData = (stats?.scoreBuckets || []).map((b: any) => ({
    range: `${b._id}–${b._id + 10}`,
    count: b.count,
  }))

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Match Engine Monitor" subtitle="Monitor synergy generation and quality distribution." />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Matches", value: stats?.total ?? "—", color: "text-blue-500" },
              { label: "Avg Score", value: stats?.avgScore ? `${Math.round(stats.avgScore)}%` : "—", color: "text-purple-500" },
              { label: "Led to Meeting", value: stats?.meetingScheduled ?? "—", color: "text-emerald-500" },
              { label: "Ignored", value: stats?.ignored ?? "—", color: "text-slate-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Histogram */}
        <div className="lg:col-span-2">
          <SectionCard title="Score Distribution" subtitle="All-time match quality distribution">
            {bucketData.length === 0 ? (
              <EmptyState icon={BarChart3} title="No score data" description="Waiting for match generations." size="sm" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={bucketData} barCategoryGap="20%">
                  <XAxis dataKey="range" tick={{ ...chartTheme.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name, email…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
        </div>
        <select value={outcomeFilter} onChange={(e) => { setOutcomeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30">
          <option value="">All Outcomes</option>
          <option value="pending">Pending</option>
          <option value="viewed">Viewed</option>
          <option value="request_sent">Request Sent</option>
          <option value="meeting_scheduled">Meeting Scheduled</option>
          <option value="ignored">Ignored</option>
        </select>
      </div>

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                {["Match ID", "Business A", "Business B", "Score", "Reasons", "Outcome", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : matches.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={Handshake} title="No matches found" description="Adjust your filters." /></td></tr>
              ) : (
                matches.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono text-slate-400">{m._id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{m.userId?.name || "—"}</p>
                      <p className="text-[11px] text-slate-400">{m.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white/80">{m.matchedUserId?.name || "—"}</p>
                      <p className="text-[11px] text-slate-400">{m.matchedUserId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        m.score >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : m.score >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {m.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {m.reasons?.slice(0, 2).map((r, i) => (
                          <span key={i} className="text-[9px] font-bold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{r}</span>
                        ))}
                        {(m.reasons?.length || 0) > 2 && <span className="text-[9px] font-bold text-slate-500">+{m.reasons.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">{m.outcome || "pending"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/5">
            <p className="text-xs font-bold text-slate-400">Page {page} of {pages} ({total})</p>
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
