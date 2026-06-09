"use client"

import { useEffect, useState } from "react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonCard } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { Cpu, Brain, Sparkles, TrendingUp, CheckCircle2, AlertTriangle, ExternalLink, HelpCircle, RefreshCw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts"

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

export default function GeminiUsagePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/gemini-usage?days=${days}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/admin/gemini-usage?days=${days}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [days])

  const summary = data?.summary || { totalCalls: 0, totalInputTokens: 0, totalOutputTokens: 0, totalTokens: 0, totalCostUSD: 0 }
  const today = data?.today || { calls: 0, tokens: 0, costUSD: 0 }
  const freeRequestsLimit = data?.freeTierInfo?.freeRequestsPerDay || 1500
  const remainingCalls = Math.max(freeRequestsLimit - today.calls, 0)
  const remainingPct = Math.round((remainingCalls / freeRequestsLimit) * 100)

  const dailyData = (data?.dailyBreakdown || []).map((d: any) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
  }))

  const features = Object.entries(data?.byFeature || {}).map(([key, value]: [string, any]) => ({
    name: key.replace("embedding_", "").toUpperCase(),
    ...value,
  }))

  const models = Object.entries(data?.byModel || {}).map(([key, value]: [string, any]) => ({
    name: key,
    ...value,
  }))

  const recentLogs = data?.recentLogs || []

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Gemini API Usage"
        subtitle="Track platform token usage, estimated costs, and AI Studio credit status."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={refreshing || loading}
              className="p-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:text-red-500 rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing && "animate-spin"}`} />
            </button>
            <div className="flex gap-1">
              {DAYS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    days === opt.value
                      ? "bg-red-600 text-white"
                      : "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Quota Card */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                    Remaining Quota Today
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    remainingPct > 50 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : remainingPct > 20 
                      ? "bg-amber-500/10 text-amber-500" 
                      : "bg-red-500/10 text-red-500"
                  }`}>
                    {remainingPct}% left
                  </span>
                </div>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                  {remainingCalls.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold mt-1">
                  out of {freeRequestsLimit.toLocaleString()} free requests/day
                </p>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-4">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    remainingPct > 50 
                      ? "bg-emerald-500" 
                      : remainingPct > 20 
                      ? "bg-amber-500" 
                      : "bg-red-500"
                  }`} 
                  style={{ width: `${remainingPct}%` }} 
                />
              </div>
            </div>

            {/* Total Calls */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                Total API Calls (Period)
              </span>
              <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                {summary.totalCalls.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold mt-1">
                over last {days} days
              </p>
              <div className="flex items-center gap-1 mt-4 text-[10px] font-black text-slate-400 dark:text-white/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                100% Successful
              </div>
            </div>

            {/* Total Tokens */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                Total Tokens Consumed
              </span>
              <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                {summary.totalTokens.toLocaleString()}
              </p>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-white/30 font-bold mt-1">
                <span>In: {summary.totalInputTokens.toLocaleString()}</span>
                <span>Out: {summary.totalOutputTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 mt-4 text-[10px] font-black text-slate-400 dark:text-white/30">
                <Brain className="h-3.5 w-3.5 text-blue-500" />
                Avg {(summary.totalCalls > 0 ? Math.round(summary.totalTokens / summary.totalCalls) : 0).toLocaleString()} per call
              </div>
            </div>

            {/* Cost Estimated */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                Estimated API Cost
              </span>
              <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                ${summary.totalCostUSD.toFixed(4)}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold mt-1">
                based on Google AI Studio pricing
              </p>
              <div className="flex items-center gap-1 mt-4 text-[10px] font-black text-slate-400 dark:text-white/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Free tier savings active
              </div>
            </div>
          </>
        )}
      </div>

      {/* API limits warning */}
      <div className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border border-red-500/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Google AI Studio Free Tier Information</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-white/40 mt-1 max-w-3xl font-bold">
            Platform currently uses Google's Free Tier Gemini API. Your API usage is rate-limited to 15 Requests Per Minute (RPM) and 1,500 Requests Per Day (RPD). If you experience errors, you can upgrade to pay-as-you-go billing in Google AI Studio to increase your throughput limits.
          </p>
        </div>
        <a
          href={data?.freeTierInfo?.dashboardUrl || "https://aistudio.google.com/app/apikey"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shrink-0 shadow-lg shadow-red-600/20"
        >
          AI Studio Settings <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily chart (left 2 cols) */}
        <div className="lg:col-span-2">
          <SectionCard title="Token & Call Trends" subtitle="Daily Gemini activity">
            {loading ? (
              <div className="h-56 bg-slate-50 dark:bg-white/2 rounded-xl animate-pulse" />
            ) : dailyData.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No usage data recorded yet" description="Make API calls (generate matches, save intent, save offering) to populate metrics." size="sm" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="dateLabel" tick={chartTheme.text} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={chartTheme.text} axisLine={false} tickLine={false} allowDecimals={false} label={{ value: 'API Calls', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(148,163,184,0.5)', fontSize: 10, fontWeight: 900 } }} />
                  <YAxis yAxisId="right" orientation="right" tick={chartTheme.text} axisLine={false} tickLine={false} allowDecimals={false} label={{ value: 'Tokens', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'rgba(148,163,184,0.5)', fontSize: 10, fontWeight: 900 } }} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, color: "rgba(148,163,184,0.8)" }} />
                  <Line yAxisId="left" type="monotone" dataKey="calls" name="API Calls" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="tokens" name="Tokens" stroke="#3b82f6" strokeWidth={3} dot={{ strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>

        {/* Feature breakdown (right 1 col) */}
        <div>
          <SectionCard title="Usage by Feature" subtitle="Resource utilization share">
            {loading ? (
              <div className="h-56 bg-slate-50 dark:bg-white/2 rounded-xl animate-pulse" />
            ) : features.length === 0 ? (
              <EmptyState icon={HelpCircle} title="No feature details" description="Feature usage breakdown will appear as calls are recorded." size="sm" />
            ) : (
              <div className="space-y-4">
                {features.map((f: any) => {
                  const maxCalls = Math.max(...features.map((item: any) => item.calls), 1)
                  const pct = Math.round((f.calls / maxCalls) * 100)
                  return (
                    <div key={f.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-white/60">
                        <span>{f.name.replace("EMBEDDING_", "EMBED ")}</span>
                        <span>{f.calls} calls (${f.costUSD.toFixed(4)})</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 dark:text-white/20 font-black">
                        <span>Tokens: {(f.inputTokens + f.outputTokens).toLocaleString()}</span>
                        <span>Share: {Math.round((f.calls / summary.totalCalls) * 100)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Model table & logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model breakdown (left 1 col) */}
        <div>
          <SectionCard title="Active Models" subtitle="Active Gemini API models config">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : models.length === 0 ? (
              <EmptyState icon={Cpu} title="No models used" description="Model metrics will appear as logs are captured." size="sm" />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {models.map((m: any) => (
                  <div key={m.name} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{m.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold mt-0.5">
                        {m.calls.toLocaleString()} calls • In: {m.inputTokens.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg">
                      {Math.round((m.calls / summary.totalCalls) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Recent logs (right 2 cols) */}
        <div className="lg:col-span-2">
          <SectionCard title="Recent API Logs" subtitle="Last 20 transactions">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-50 dark:bg-white/2 rounded animate-pulse" />
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <EmptyState icon={HelpCircle} title="No logs found" description="Logs will be visible here once requests start." size="sm" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500 dark:text-white/50 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Feature</th>
                      <th className="pb-3">Model</th>
                      <th className="pb-3 text-right">Tokens (I/O)</th>
                      <th className="pb-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold">
                    {recentLogs.map((log: any) => (
                      <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                        <td className="py-2.5 text-[11px] text-slate-400 dark:text-white/30">
                          {new Date(log.createdAt).toLocaleString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            log.feature === "reranking" 
                              ? "bg-amber-500/10 text-amber-500" 
                              : "bg-blue-500/10 text-blue-500"
                          }`}>
                            {log.feature.replace("embedding_", "")}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[10px] text-slate-700 dark:text-white/60">
                          {log.model}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[10px] text-slate-700 dark:text-white/60">
                          {log.inputTokens.toLocaleString()} / {log.outputTokens.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-emerald-500 font-mono text-[10px]">
                          ${log.costUSD.toFixed(5)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
