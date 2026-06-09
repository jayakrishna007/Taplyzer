"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonCard } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { BarChart3, TrendingUp, Users, MapPin } from "lucide-react"

const DAYS_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
]

const chartTheme = {
  grid: { stroke: "rgba(255,255,255,0.05)" },
  text: { fill: "rgba(148,163,184,0.8)", fontSize: 11, fontWeight: 700 },
  tooltip: {
    contentStyle: { background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" },
    labelStyle: { fontWeight: 800, color: "#fff" },
  },
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`)
      setData(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [days])

  // Build unified daily pipeline data
  const pipelineData = (() => {
    if (!data) return []
    const dateMap: Record<string, { date: string; matches: number; requests: number; meetings: number }> = {}
    data.pipeline?.dailyMatches?.forEach((d: any) => { dateMap[d._id] = { ...dateMap[d._id], date: d._id, matches: d.count } })
    data.pipeline?.dailyRequests?.forEach((d: any) => { dateMap[d._id] = { ...dateMap[d._id], date: d._id, requests: d.count } })
    data.pipeline?.dailyMeetings?.forEach((d: any) => { dateMap[d._id] = { ...dateMap[d._id], date: d._id, meetings: d.count } })
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({
      ...d,
      matches: d.matches || 0,
      requests: d.requests || 0,
      meetings: d.meetings || 0,
      dateLabel: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    }))
  })()

  const hasData = pipelineData.length > 0

  const funnel = data?.funnel
  const funnelSteps = funnel ? [
    { label: "Signups", value: funnel.totalSignups, color: "bg-blue-500" },
    { label: "Completed Profiles", value: funnel.profileComplete, color: "bg-indigo-500" },
    { label: "Requests Sent", value: funnel.requestsSent, color: "bg-purple-500" },
    { label: "Requests Accepted", value: funnel.requestsAccepted, color: "bg-amber-500" },
    { label: "Meetings Scheduled", value: funnel.meetingsScheduled, color: "bg-orange-500" },
    { label: "Meetings Completed", value: funnel.meetingsCompleted, color: "bg-emerald-500" },
  ] : []
  const maxFunnelVal = Math.max(...funnelSteps.map((s) => s.value || 0), 1)

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Analytics"
        subtitle="Platform intelligence — real funnel, pipeline, and deal flow metrics."
        actions={
          <div className="flex gap-1">
            {DAYS_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${days === opt.value ? "bg-red-600 text-white" : "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Funnel KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            {[
              { label: "Profile Completion Rate", value: `${funnel?.signupToProfileRate ?? 0}%`, color: "text-blue-500" },
              { label: "Request Acceptance Rate", value: `${funnel?.acceptanceRate ?? 0}%`, color: "text-amber-500" },
              { label: "Meeting Completion Rate", value: `${funnel?.meetingCompletionRate ?? 0}%`, color: "text-emerald-500" },
            ].map((k) => (
              <div key={k.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5">
                <p className={`text-3xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-1">{k.label}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pipeline Chart */}
      <SectionCard title="Pipeline Volume" subtitle="Daily matches, requests & meetings (last 7 days)">
        {loading ? (
          <div className="h-56 bg-slate-50 dark:bg-white/2 rounded-xl animate-pulse" />
        ) : !hasData ? (
          <EmptyState icon={BarChart3} title="Not enough pipeline data yet" description="Pipeline volume will appear as users interact with the platform." size="sm" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="dateLabel" tick={chartTheme.text} axisLine={false} tickLine={false} />
              <YAxis tick={chartTheme.text} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, color: "rgba(148,163,184,0.8)" }} />
              <Bar dataKey="matches" name="Matches" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="requests" name="Requests" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meetings" name="Meetings" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funnel Visualization */}
        <SectionCard title="Intent → Deal Funnel" subtitle={`Last ${days} days`}>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />)}</div>
          ) : funnelSteps.every((s) => s.value === 0) ? (
            <EmptyState icon={TrendingUp} title="Not enough deal activity yet" description="Funnel data will appear as users progress through the platform." size="sm" />
          ) : (
            <div className="space-y-3">
              {funnelSteps.map((step, i) => {
                const pct = Math.round((step.value / maxFunnelVal) * 100)
                const dropoff = i > 0 && funnelSteps[i - 1].value > 0
                  ? Math.round(((funnelSteps[i - 1].value - step.value) / funnelSteps[i - 1].value) * 100)
                  : 0
                return (
                  <div key={step.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-white/60">{step.label}</span>
                      <div className="flex items-center gap-2">
                        {i > 0 && dropoff > 0 && (
                          <span className="text-[10px] font-black text-red-400">-{dropoff}%</span>
                        )}
                        <span className="text-xs font-black text-slate-900 dark:text-white">{step.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${step.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        {/* Industry Distribution */}
        <SectionCard title="Top Industries" subtitle="Business distribution by sector">
          {loading ? (
            <div className="h-48 bg-slate-50 dark:bg-white/2 rounded-xl animate-pulse" />
          ) : !data?.industryDistribution?.length ? (
            <EmptyState icon={BarChart3} title="No industry data yet" description="Industry distribution will appear as businesses register." size="sm" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.industryDistribution.map((d: any) => ({ name: d._id?.slice(0, 12) || "Other", count: d.count }))} layout="vertical" barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                <XAxis type="number" tick={chartTheme.text} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={chartTheme.text} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="count" name="Businesses" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* City Distribution */}
      <SectionCard title="Top Cities" subtitle="Geographic distribution of businesses">
        {loading ? (
          <div className="h-48 bg-slate-50 dark:bg-white/2 rounded-xl animate-pulse" />
        ) : !data?.cityDistribution?.length ? (
          <EmptyState icon={MapPin} title="No location data yet" description="City data will appear as businesses add their location." size="sm" />
        ) : (
          <div className="space-y-3">
            {data.cityDistribution.map((c: any, i: number) => {
              const maxCount = data.cityDistribution[0]?.count || 1
              const pct = Math.round((c.count / maxCount) * 100)
              return (
                <div key={c._id} className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 dark:text-white/20 w-4 shrink-0">{i + 1}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-white/60 w-28 truncate shrink-0">{c._id || "Unknown"}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-black text-slate-500 dark:text-white/40 w-8 text-right shrink-0">{c.count}</span>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
