"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Users, UserPlus, ShieldCheck, UserX, Handshake, Send, Calendar,
  CheckCircle2, ShieldAlert, Star, CreditCard, TrendingUp, Activity,
  ArrowRight, Zap, RefreshCw
} from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonCard } from "@/components/admin/SectionCard"
import { AdminActivityFeed } from "@/components/admin/activity-feed"

interface AdminStats {
  healthScore: number
  users: { total: number; active: number; suspended: number; newToday: number; verified: number; flagged: number }
  businesses: { total: number; pendingVerification: number; verified: number }
  activity: { matchesToday: number; totalMatches: number; requestsSent: number; requestsAccepted: number; requestsPending: number; meetingsScheduled: number; meetingsCompleted: number; meetingsCancelled: number }
  trust: { pendingVerification: number; flagged: number; lowRated: number; totalRatings: number }
  revenue: { activeSubscriptions: number; proUsers: number; freeUsers: number }
  funnel: { signupToProfile: number; acceptanceRate: number; requestToMeeting: number; meetingCompletionRate: number }
}

function StatCard({ label, value, sub, icon: Icon, color, href }: any) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    red: "text-red-500 bg-red-50 dark:bg-red-900/20",
    amber: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    purple: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
    slate: "text-slate-400 bg-slate-50 dark:bg-white/5",
  }
  const card = (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-5 hover:border-slate-300 dark:hover:border-white/10 transition-all group">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[color] || colorMap.slate}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-0.5">{label}</p>
      {sub && <p className="text-xs font-bold text-slate-400 dark:text-white/25 mt-1.5 border-t border-slate-100 dark:border-white/5 pt-1.5">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"
  const label = score >= 70 ? "Healthy" : score >= 40 ? "Fair" : "Needs Attention"
  const r = 40, cx = 50, cy = 50
  const circumference = Math.PI * r // semi-circle
  const filled = (score / 100) * circumference

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-6 flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="100" height="60" viewBox="0 0 100 60">
          <path d={`M10,50 A40,40 0 0,1 90,50`} fill="none" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="8" strokeLinecap="round" />
          <path d={`M10,50 A40,40 0 0,1 90,50`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-xl font-black text-slate-900 dark:text-white">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Platform Health</p>
        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{label}</p>
        <p className="text-xs font-bold text-slate-400 dark:text-white/25 mt-1">Derived from funnel conversion</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data)
      setLastRefreshed(new Date())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const funnel = [
    { label: "Signup → Profile",    value: stats?.funnel?.signupToProfile ?? 0,       color: "bg-blue-500" },
    { label: "Request Acceptance",  value: stats?.funnel?.acceptanceRate ?? 0,          color: "bg-purple-500" },
    { label: "Request → Meeting",   value: stats?.funnel?.requestToMeeting ?? 0,        color: "bg-amber-500" },
    { label: "Meeting Completion",  value: stats?.funnel?.meetingCompletionRate ?? 0,   color: "bg-emerald-500" },
  ]

  return (
    <div className="space-y-8 pb-20">
      <AdminPageHeader
        title="Control Room"
        subtitle="Intent Network Operating System — real-time platform intelligence"
        live
        actions={
          <button onClick={fetchStats} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        }
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Review Verifications", href: "/admin/verification", icon: ShieldCheck, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30" },
          { label: "Open Flags", href: "/admin/flags", icon: ShieldAlert, color: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30" },
          { label: "Send Broadcast", href: "/admin/notifications", icon: Send, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30" },
          { label: "Network Ops", href: "/admin/noc", icon: Zap, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30" },
        ].map((q) => (
          <Link key={q.href} href={q.href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer ${q.color}`}>
              <q.icon className="h-4 w-4 shrink-0" />
              <span className="text-xs font-black">{q.label}</span>
              <ArrowRight className="h-3 w-3 ml-auto shrink-0 opacity-60" />
            </div>
          </Link>
        ))}
      </div>

      {/* Health + Last Refreshed */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          {loading ? <SkeletonCard /> : <HealthGauge score={stats?.healthScore ?? 0} />}
        </div>
        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
          {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard label="Pending Verifications" value={stats?.trust?.pendingVerification ?? 0} icon={ShieldCheck} color="amber" sub="Awaiting review" href="/admin/verification" />
              <StatCard label="Open Flags" value={stats?.trust?.flagged ?? 0} icon={ShieldAlert} color="red" sub="Need action" href="/admin/flags" />
              <StatCard label="Matches Today" value={stats?.activity?.matchesToday ?? 0} icon={Handshake} color="purple" sub="New pairs generated" href="/admin/matches" />
            </>
          )}
        </div>
      </div>

      {/* KPI Row 1: Users */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25 mb-3">Users</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard label="Total Users" value={stats?.users?.total ?? 0} icon={Users} color="blue" href="/admin/users" />
              <StatCard label="Active" value={stats?.users?.active ?? 0} icon={CheckCircle2} color="emerald" href="/admin/users" />
              <StatCard label="New Today" value={stats?.users?.newToday ?? 0} icon={UserPlus} color="emerald" href="/admin/users" />
              <StatCard label="Verified Biz" value={stats?.businesses?.verified ?? 0} icon={ShieldCheck} color="blue" href="/admin/verification" />
              <StatCard label="Suspended" value={stats?.users?.suspended ?? 0} icon={UserX} color="red" sub={`${stats?.users?.flagged ?? 0} flagged`} href="/admin/users" />
            </>
          )}
        </div>
      </section>

      {/* KPI Row 2: Deal Flow */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25 mb-3">Deal Flow</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard label="Requests Sent" value={stats?.activity?.requestsSent ?? 0} icon={Send} color="blue" href="/admin/requests" />
              <StatCard label="Accepted" value={stats?.activity?.requestsAccepted ?? 0} icon={CheckCircle2} color="emerald" sub={`${stats?.funnel?.acceptanceRate ?? 0}% rate`} href="/admin/requests" />
              <StatCard label="Meetings Scheduled" value={stats?.activity?.meetingsScheduled ?? 0} icon={Calendar} color="purple" href="/admin/meetings" />
              <StatCard label="Completed" value={stats?.activity?.meetingsCompleted ?? 0} icon={CheckCircle2} color="emerald" sub={`${stats?.funnel?.meetingCompletionRate ?? 0}% completion`} href="/admin/meetings" />
            </>
          )}
        </div>
      </section>

      {/* KPI Row 3: Revenue */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25 mb-3">Revenue</p>
        <div className="grid grid-cols-3 gap-4">
          {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard label="Active Subscriptions" value={stats?.revenue?.activeSubscriptions ?? 0} icon={CreditCard} color="emerald" href="/admin/subscriptions" />
              <StatCard label="PRO Users" value={stats?.revenue?.proUsers ?? 0} icon={Star} color="purple" href="/admin/subscriptions" />
              <StatCard label="Free Users" value={stats?.revenue?.freeUsers ?? 0} icon={Users} color="slate" href="/admin/subscriptions" />
            </>
          )}
        </div>
      </section>

      {/* Funnel + Activity Feed */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Funnel */}
        <div className="lg:col-span-2">
          <SectionCard title="Intent → Deal Pipeline" subtitle="Core conversion funnel">
            <div className="space-y-5">
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-3 w-40 bg-slate-100 dark:bg-white/5 rounded" />
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full" />
                </div>
              )) : funnel.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{row.label}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{row.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${row.color}`} style={{ width: `${Math.min(row.value, 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25">
                  North Star: Intent → Match → Meeting → Deal
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
        {/* Activity Feed */}
        <div className="lg:col-span-3">
          <AdminActivityFeed />
        </div>
      </div>
    </div>
  )
}
