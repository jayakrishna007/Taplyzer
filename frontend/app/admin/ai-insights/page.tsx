"use client"

import { useEffect, useState } from "react"
import { Sparkles, FlaskConical, TrendingUp, Target, BarChart3, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonCard } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder"

const chartTheme = {
  tooltip: {
    contentStyle: { background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" },
    labelStyle: { fontWeight: 800, color: "#fff" },
  },
  text: { fill: "rgba(148,163,184,0.8)", fontSize: 11, fontWeight: 700 },
}

export default function AdminAIInsightsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/ai-insights").then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  const hasEnoughData = data?.insights?.hasEnoughData === true
  const insights = data?.insights || {}
  const scoreData = (data?.scoreBuckets || []).map((b: any) => ({
    range: `${b._id}–${b._id + 10}`,
    count: b.count,
  }))
  const outcomeData = (data?.outcomeBreakdown || []).map((o: any) => ({
    name: o._id || "No Outcome",
    count: o.count,
  }))

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="AI Match Insights"
        subtitle="Pattern intelligence from live network data. No fake AI — only real aggregations."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-900/30 rounded-full text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" /> Beta
          </span>
        }
      />

      {/* Data sufficiency gate */}
      {!loading && !hasEnoughData && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-amber-700 dark:text-amber-400">Collecting more network activity</p>
            <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/60 mt-0.5">
              Insights become meaningful once more businesses interact. Keep building the network.
            </p>
          </div>
        </div>
      )}

      {/* Key Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            {/* Verified vs Unverified */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Verification Impact</p>
              </div>
              {!hasEnoughData ? (
                <p className="text-sm font-bold text-slate-400 dark:text-white/25">Not enough verified interaction data yet.</p>
              ) : (
                <>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {insights.verifiedMultiplier !== "N/A" ? `${insights.verifiedMultiplier}×` : "—"}
                  </p>
                  <p className="text-sm font-bold text-slate-500 dark:text-white/40 mt-1">
                    Verified businesses get {insights.verifiedMultiplier}× more accepted requests than unverified.
                  </p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✅ Verified: {insights.verifiedAcceptanceRate}% acceptance</span>
                    <span className="text-[11px] font-bold text-slate-400">Unverified: {insights.unverifiedAcceptanceRate}% acceptance</span>
                  </div>
                </>
              )}
            </div>

            {/* Score distribution summary */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Match Score Distribution</p>
              </div>
              {scoreData.length === 0 ? (
                <p className="text-sm font-bold text-slate-400 dark:text-white/25">No match score data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={scoreData} barCategoryGap="20%">
                    <XAxis dataKey="range" tick={{ ...chartTheme.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Missed opportunities */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Missed Opportunities</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">High-score matches (≥70) that were ignored</p>
                </div>
              </div>
              {!data?.missedOpportunities?.length ? (
                <p className="text-sm font-bold text-slate-400 dark:text-white/25">No ignored high-score matches found. Good signal!</p>
              ) : (
                <div className="space-y-2">
                  {data.missedOpportunities.slice(0, 5).map((m: any) => (
                    <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/3">
                      <span className="text-sm font-bold text-slate-700 dark:text-white/60">
                        {m.userId?.name || "?"} → {m.matchedUserId?.name || "?"}
                      </span>
                      <span className="text-xs font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                        Score {m.score} · Ignored
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Meeting Outcome Breakdown */}
      <SectionCard title="Meeting Outcome Distribution" subtitle="How completed meetings resolve">
        {loading ? <div className="h-48 bg-slate-50 dark:bg-white/2 rounded-xl animate-pulse" /> :
         !outcomeData.length ? (
          <EmptyState icon={BarChart3} title="No meeting outcome data yet" description="Outcome patterns will appear after meetings are completed." size="sm" />
         ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={outcomeData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" tick={chartTheme.text} axisLine={false} tickLine={false} />
              <YAxis tick={chartTheme.text} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Bar dataKey="count" name="Meetings" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
         )}
      </SectionCard>
    </div>
  )
}
