"use client"

import { useEffect, useState } from "react"
import { Cpu, TrendingDown, AlertTriangle, Users, Clock, ArrowRight, Zap, RefreshCw, Target } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"

interface NOCData {
  metrics: { totalMatches: number; acceptanceRate: number; meetingConversionRate: number; stuckDealsCount: number }
  stuckDeals: any[]
  weakMatches: any[]
  highPotential: any[]
  humanReviewQueue: any[]
}

function MetricPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${color}`}>
      <span className="text-lg font-black">{value}</span>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
    </div>
  )
}

export default function AdminNOCPage() {
  const [data, setData] = useState<NOCData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/noc")
      setData(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="space-y-8 pb-20">
      <AdminPageHeader
        title="Network Operations Center"
        subtitle="Human-controlled matchmaking operations — the heart of Taplyzer."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-full text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">
            <Cpu className="h-3 w-3" /> Human Controlled
          </span>
        }
        actions={
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-all">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        }
      />

      {/* NOC Health Bar */}
      <div className="flex flex-wrap gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 w-40 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />)
        ) : (
          <>
            <MetricPill label="Total Matches" value={data?.metrics?.totalMatches ?? 0} color="border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10" />
            <MetricPill label="Acceptance Rate" value={`${data?.metrics?.acceptanceRate ?? 0}%`} color={`border-${(data?.metrics?.acceptanceRate ?? 0) >= 40 ? "emerald" : "amber"}-200 dark:border-${(data?.metrics?.acceptanceRate ?? 0) >= 40 ? "emerald" : "amber"}-900/30 text-${(data?.metrics?.acceptanceRate ?? 0) >= 40 ? "emerald" : "amber"}-700 dark:text-${(data?.metrics?.acceptanceRate ?? 0) >= 40 ? "emerald" : "amber"}-400 bg-${(data?.metrics?.acceptanceRate ?? 0) >= 40 ? "emerald" : "amber"}-50 dark:bg-${(data?.metrics?.acceptanceRate ?? 0) >= 40 ? "emerald" : "amber"}-900/10`} />
            <MetricPill label="Meeting Conversion" value={`${data?.metrics?.meetingConversionRate ?? 0}%`} color="border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10" />
            <MetricPill label="Stuck Deals" value={data?.metrics?.stuckDealsCount ?? 0} color="border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Stuck Deals */}
        <SectionCard title="Stuck Deals" subtitle="Accepted requests with no meeting after 7 days" noPadding>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4 h-16 bg-slate-50 dark:bg-white/2 animate-pulse" />)
            ) : (data?.stuckDeals?.length ?? 0) === 0 ? (
              <EmptyState icon={Clock} title="No stuck deals" description="All accepted requests have follow-up activity." size="sm" />
            ) : (
              data!.stuckDeals.map((deal: any) => {
                const daysStuck = Math.floor((Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={deal._id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 dark:text-white/80 truncate">
                            {deal.senderId?.name || "Unknown"}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-300 dark:text-white/20 shrink-0" />
                          <span className="text-sm font-bold text-slate-600 dark:text-white/60 truncate">
                            {deal.receiverId?.name || "Unknown"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">Accepted · no meeting scheduled</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                        {daysStuck}d stuck
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </SectionCard>

        {/* High Potential Opportunities */}
        <SectionCard title="High Potential Opportunities" subtitle="Strong matches not yet acted on (score ≥75)" noPadding>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4 h-16 bg-slate-50 dark:bg-white/2 animate-pulse" />)
            ) : (data?.highPotential?.length ?? 0) === 0 ? (
              <EmptyState icon={Target} title="No high-potential matches" description="Strong opportunities will appear as match data grows." size="sm" />
            ) : (
              data!.highPotential.map((match: any) => (
                <div key={match._id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 dark:text-white/80 truncate">
                          {match.userId?.name || "User A"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-300 dark:text-white/20 shrink-0" />
                        <span className="text-sm font-bold text-slate-600 dark:text-white/60 truncate">
                          {match.matchedUserId?.name || "User B"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">
                        Not yet requested · match viewed or pending
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        match.score >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {match.score}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weak / Ignored Matches */}
        <SectionCard title="Weak & Ignored Matches" subtitle="Low-score or ignored matches to review" noPadding>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4 h-14 bg-slate-50 dark:bg-white/2 animate-pulse" />)
            ) : (data?.weakMatches?.length ?? 0) === 0 ? (
              <EmptyState icon={TrendingDown} title="No weak matches" description="All recent matches are performing well." size="sm" />
            ) : (
              data!.weakMatches.slice(0, 8).map((match: any) => (
                <div key={match._id} className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                    match.score < 30 ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  }`}>
                    {match.score ?? "—"}%
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-white/70 truncate">
                      {match.userId?.name || "?"} → {match.matchedUserId?.name || "?"}
                    </p>
                  </div>
                  {match.outcome === "ignored" && (
                    <span className="text-[10px] font-black text-slate-400 dark:text-white/20 shrink-0">Ignored</span>
                  )}
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Human Review Queue */}
        <SectionCard title="Human Review Queue" subtitle="Businesses needing profile or intent cleanup" noPadding>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4 h-14 bg-slate-50 dark:bg-white/2 animate-pulse" />)
            ) : (data?.humanReviewQueue?.length ?? 0) === 0 ? (
              <EmptyState icon={Users} title="No reviews needed" description="All businesses have sufficient profile quality." size="sm" />
            ) : (
              data!.humanReviewQueue.map((biz: any) => {
                const issues = []
                if ((biz.profileScore ?? 100) < 40) issues.push("Low score")
                if (!biz.offerings?.length) issues.push("No offerings")
                if (!biz.needs?.length) issues.push("No needs")
                return (
                  <div key={biz._id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 dark:text-white/80 truncate">{biz.name || "Unknown"}</p>
                        <p className="text-[11px] text-slate-400 dark:text-white/25">{biz.industry} · {biz.userId?.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 shrink-0">
                        {issues.map((issue) => (
                          <span key={issue} className="text-[9px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
