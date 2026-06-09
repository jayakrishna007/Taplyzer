"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import {
  Star, Inbox, Send, Award, MessageCircle, Zap,
  ShieldCheck, TrendingUp, Loader2, Clock
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= Math.round(score) ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-white/10"}`}
        />
      ))}
    </div>
  )
}

function TagBadge({ tag }: { tag: string }) {
  const negatives = ["Time Waster", "Didn't Show Up", "Not Relevant"]
  const isNeg = negatives.includes(tag)
  return (
    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
      isNeg
        ? "bg-red-50 dark:bg-red-900/10 text-red-500 border-red-200 dark:border-red-800"
        : "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
    }`}>{tag}</span>
  )
}

function DimBadge({ label, value }: { label: string; value: string }) {
  if (!value) return null
  const good = ["Good", "High", "Strong"]
  const bad  = ["Poor", "Low", "Weak"]
  const color = good.includes(value)
    ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
    : bad.includes(value)
    ? "bg-red-50 dark:bg-red-900/10 text-red-500 border-red-200 dark:border-red-800"
    : "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10"
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${color}`}>
      <span className="text-slate-400 dark:text-white/30">{label}:</span> {value}
    </span>
  )
}

function EmptyState({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="py-24 flex flex-col items-center text-center opacity-50">
      <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-5">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <p className="text-base font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">{title}</p>
      <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs">{sub}</p>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "Today"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function RatingsPage() {
  const { user } = useAuth()
  const [received, setReceived] = useState<any[]>([])
  const [given, setGiven] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchRatings = useCallback(async () => {
    if (!user?._id) return
    try {
      const res = await fetch(`/api/ratings/${user._id}`)
      if (res.ok) {
        const data = await res.json()
        setReceived(data.received || [])
        setGiven(data.given || [])
        setSummary(data.summary || {})
      }
    } catch (err) {
      console.error("Failed to fetch ratings:", err)
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => { fetchRatings() }, [fetchRatings])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasAnyData = received.length > 0

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic mb-2">
          Ratings &amp; Feedback
        </h1>
        <p className="text-slate-500 dark:text-white/40 font-black text-sm uppercase tracking-widest">
          Your deal trust score — built from real interactions
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Avg Rating */}
        <Card className="p-6 bg-primary border-none rounded-[2rem] text-white relative overflow-hidden col-span-2 md:col-span-1">
          <Award className="absolute -top-4 -right-4 h-28 w-28 text-white/10" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block mb-3">Trust Score</span>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-black italic tracking-tighter">
              {hasAnyData ? summary?.avgRating : "—"}
            </span>
            <span className="text-xl font-black text-white/50 pb-1">/ 5</span>
          </div>
          <StarRow score={summary?.avgRating || 0} />
        </Card>

        <Card className="p-6 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem]">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Total Reviews</span>
          <span className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">
            {summary?.totalReviews || 0}
          </span>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Verified feedback</p>
        </Card>

        <Card className="p-6 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem]">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Communication</span>
          <span className="text-4xl font-black italic tracking-tighter text-emerald-500">
            {summary?.commGood || 0}
          </span>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Rated "Good"</p>
        </Card>

        <Card className="p-6 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem]">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Deal Closed</span>
          <span className="text-4xl font-black italic tracking-tighter text-primary">
            {summary?.dealStrong || 0}
          </span>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Strong deals</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="bg-white dark:bg-[#0A0A0A] p-1 rounded-2xl h-16 mb-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100 dark:shadow-none">
          <TabsTrigger
            value="received"
            className="rounded-xl px-8 md:px-12 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
          >
            <Inbox className="h-3.5 w-3.5" /> Received ({received.length})
          </TabsTrigger>
          <TabsTrigger
            value="given"
            className="rounded-xl px-8 md:px-12 h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
          >
            <Send className="h-3.5 w-3.5" /> Given ({given.length})
          </TabsTrigger>
        </TabsList>

        {/* RECEIVED */}
        <TabsContent value="received" className="space-y-4">
          {received.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No Feedback Yet"
              sub="Complete your first meeting to start building your trust score on Taplyzer."
            />
          ) : (
            received.map((r: any) => (
              <div
                key={r._id}
                className="p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 group hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center font-black text-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    {(r.fromBizName || "?")[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">
                        {r.fromBizName || "Anonymous"}
                      </h3>
                      {r.dealType && (
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                          {r.dealType}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-3 mb-4">
                      <StarRow score={r.rating} />
                      <span className="text-2xl font-black italic text-slate-900 dark:text-white">
                        {r.rating}.0
                      </span>
                    </div>

                    {/* Comment */}
                    {r.comment && (
                      <p className="text-slate-600 dark:text-slate-400 font-medium italic text-sm leading-relaxed mb-4">
                        "{r.comment}"
                      </p>
                    )}

                    {/* Structured dims */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <DimBadge label="Communication" value={r.communication} />
                      <DimBadge label="Reliability" value={r.reliability} />
                      <DimBadge label="Deal" value={r.dealSeriousness} />
                    </div>

                    {/* Tags */}
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {r.tags.map((tag: string) => <TagBadge key={tag} tag={tag} />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* GIVEN */}
        <TabsContent value="given" className="space-y-4">
          {given.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No Feedback Given"
              sub="After completing meetings, leave feedback to help others trust the network."
            />
          ) : (
            given.map((r: any) => (
              <div
                key={r._id}
                className="p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 group hover:border-primary/20 hover:shadow-xl transition-all duration-500 opacity-90 hover:opacity-100"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center font-black text-2xl text-slate-400 shrink-0">
                    {(r.toBizName || "?")[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">
                        {r.toBizName || "Partner"}
                      </h3>
                      {r.dealType && (
                        <Badge className="bg-slate-100 dark:bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest border-none">
                          {r.dealType}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <StarRow score={r.rating} />
                      <span className="text-2xl font-black italic text-slate-900 dark:text-white">{r.rating}.0</span>
                    </div>

                    {r.comment && (
                      <p className="text-slate-600 dark:text-slate-400 font-medium italic text-sm leading-relaxed mb-4">
                        "{r.comment}"
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <DimBadge label="Communication" value={r.communication} />
                      <DimBadge label="Reliability" value={r.reliability} />
                      <DimBadge label="Deal" value={r.dealSeriousness} />
                    </div>

                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {r.tags.map((tag: string) => <TagBadge key={tag} tag={tag} />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
