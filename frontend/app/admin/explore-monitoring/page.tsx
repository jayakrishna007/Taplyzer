"use client"

import { useEffect, useState } from "react"
import { Search, Map, BarChart3, TrendingUp, AlertCircle } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"

export default function AdminExploreMonitoringPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/explore-monitoring").then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Explore Monitoring" subtitle="Market intelligence engine — search trends and unmet demand." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Searches", value: data?.stats?.total ?? "—", color: "text-blue-500" },
          { label: "Unique Queries", value: data?.stats?.unique ?? "—", color: "text-purple-500" },
          { label: "Zero Results", value: data?.stats?.zeroResults ?? "—", color: "text-red-500" },
          { label: "Categories Searched", value: data?.stats?.categories ?? "—", color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        <SectionCard title="Top Search Queries" subtitle="Highest volume search terms" noPadding>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-slate-50 dark:bg-white/2" />)
            ) : !data?.topQueries?.length ? (
              <EmptyState icon={Search} title="No search data" size="sm" />
            ) : (
              data.topQueries.map((q: any) => {
                const max = data.topQueries[0]?.count || 1
                const pct = Math.round((q.count / max) * 100)
                return (
                  <div key={q._id} className="p-3 flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-800 dark:text-white/80 w-32 truncate">{q._id}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-500 w-8 text-right">{q.count}</span>
                  </div>
                )
              })
            )}
          </div>
        </SectionCard>

        {/* Supply Gap Alerts */}
        <SectionCard title="Supply Gap Alerts" subtitle="High volume queries returning zero results" noPadding>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-slate-50 dark:bg-white/2" />)
            ) : !data?.supplyGaps?.length ? (
              <EmptyState icon={CheckCircle2} title="No supply gaps detected" description="All popular searches have results." size="sm" />
            ) : (
              data.supplyGaps.map((q: any) => (
                <div key={q._id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-bold text-red-700 dark:text-red-400">"{q._id}"</span>
                  </div>
                  <span className="text-xs font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                    {q.count} searches
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
// added CheckCircle2 up top to avoid errors
import { CheckCircle2 } from "lucide-react"
