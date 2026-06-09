"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  MessageSquare, Clock, CheckCircle2, XCircle, 
  ArrowRight, Check, X, Calendar, Loader2, Inbox, Send, Zap, Star
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { FeedbackModal } from "@/components/modals/feedback-modal"

interface IntroRequest {
  _id: string
  senderId: string
  receiverId: string
  senderBizName: string
  receiverBizName: string
  dealType: string
  message: string
  summary: string
  matchScore: number
  status: "pending" | "accepted" | "rejected"
  connectionToken: string | null
  createdAt: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function StatusBadge({ status }: { status: IntroRequest["status"] }) {
  if (status === "accepted") {
    return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-black uppercase text-[9px] tracking-widest">Accepted</Badge>
  }
  if (status === "rejected") {
    return <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-black uppercase text-[9px] tracking-widest">Rejected</Badge>
  }
  return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20 font-black uppercase text-[9px] tracking-widest">Pending</Badge>
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="py-24 flex flex-col items-center text-center opacity-50">
      <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-5">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <p className="text-base font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">{title}</p>
      <p className="text-sm font-medium text-slate-400 mt-2">{subtitle}</p>
    </div>
  )
}

function ConnectionTokenCard({ token, partnerName }: { token: string; partnerName: string }) {
  return (
    <div className="mt-4 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Connection Established</span>
      </div>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
        You are now connected with <span className="font-black text-slate-900 dark:text-white">{partnerName}</span>. Use your connection token to schedule a meeting.
      </p>
      <div className="flex items-center gap-2 bg-white dark:bg-black/20 rounded-xl p-3 border border-emerald-500/10 mb-4">
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate flex-1">{token}</span>
      </div>
      <Link href={`/meetings?token=${token}`}>
        <Button className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" /> Schedule Meeting
        </Button>
      </Link>
    </div>
  )
}

export default function RequestsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("received")
  const [received, setReceived] = useState<IntroRequest[]>([])
  const [sent, setSent] = useState<IntroRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedbackTarget, setFeedbackTarget] = useState<{ partnerName: string; connectionToken: string } | null>(null)

  const fetchRequests = useCallback(async () => {
    if (!user?._id) return
    try {
      const res = await fetch(`/api/requests/${user._id}`)
      if (res.ok) {
        const data = await res.json()
        setReceived(data.received || [])
        setSent(data.sent || [])
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleAction = async (requestId: string, action: "accept" | "reject", partnerName: string) => {
    setActionLoading(requestId + action)
    try {
      const res = await fetch(`/api/requests/${requestId}/${action}`, {
        method: "PATCH",
      })
      const data = await res.json()

      if (res.ok) {
        if (action === "accept") {
          toast.success(`Connected with ${partnerName}! 🎉 A meeting token has been created.`)
        } else {
          toast.info(`Request from ${partnerName} declined.`)
        }
        // Refresh the list
        await fetchRequests()
      } else {
        toast.error(data.msg || "Action failed. Please try again.")
      }
    } catch (err) {
      toast.error("Network error. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  // Filter logic
  const receivedRequests = received.filter(r => r.status !== "accepted")
  const sentRequests = sent.filter(r => r.status !== "accepted")
  const acceptedRequests = [...received, ...sent]
    .filter(r => r.status === "accepted")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pendingCount = receivedRequests.filter(r => r.status === "pending").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic mb-2">Intro Requests</h1>
        <p className="text-slate-500 dark:text-white/40 font-medium text-sm uppercase tracking-widest font-black">Manage your deal-making introductions</p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="flex w-full bg-white dark:bg-[#0A0A0A] p-1 rounded-2xl h-16 mb-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100 dark:shadow-none">
          <TabsTrigger value="received" className="flex-1 rounded-xl px-1 sm:px-8 md:px-12 h-full font-black uppercase tracking-widest text-[8px] xs:text-[9px] sm:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2">
            <Inbox className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Received</span> {pendingCount > 0 && <span className="bg-white/20 text-white rounded-full px-1.5 py-0.5 text-[9px] shrink-0">{pendingCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex-1 rounded-xl px-1 sm:px-8 md:px-12 h-full font-black uppercase tracking-widest text-[8px] xs:text-[9px] sm:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2">
            <Send className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Sent ({sentRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1 rounded-xl px-1 sm:px-8 md:px-12 h-full font-black uppercase tracking-widest text-[8px] xs:text-[9px] sm:text-[10px] data-[state=active]:bg-emerald-500 data-[state=active]:text-white shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Accepted ({acceptedRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* RECEIVED TAB */}
        <TabsContent value="received" className="space-y-4">
          {receivedRequests.length === 0 ? (
            <EmptyState icon={Inbox} title="No Requests Yet" subtitle="When other businesses send you an intro request, they'll appear here." />
          ) : (
            receivedRequests.map(r => (
              <div key={r._id} className="p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 group hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center font-black text-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    {r.senderBizName[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">{r.senderBizName}</h3>
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-black uppercase text-[9px] tracking-widest">{r.dealType}</Badge>
                      <StatusBadge status={r.status} />
                      {r.matchScore > 0 && (
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{r.matchScore}% Match</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic mb-1">"{r.message}"</p>
                    {r.summary && (
                      <p className="text-xs font-medium text-slate-400 mt-1 mb-2">Opportunity: {r.summary}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">
                      <Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-3 mt-5">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] border-red-200 text-red-600 hover:bg-red-50 dark:border-white/10 dark:text-red-400 dark:hover:bg-red-500/10 transition-all"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction(r._id, "reject", r.senderBizName)}
                        >
                          {actionLoading === r._id + "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1" /> Decline</>}
                        </Button>
                        <Button
                          className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction(r._id, "accept", r.senderBizName)}
                        >
                          {actionLoading === r._id + "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Accept</>}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* SENT TAB */}
        <TabsContent value="sent" className="space-y-4">
          {sentRequests.length === 0 ? (
            <EmptyState icon={Send} title="No Sent Requests" subtitle="Requests you send from Explore or Matches will appear here." />
          ) : (
            sentRequests.map(r => (
              <div key={r._id} className="p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 group hover:border-primary/20 hover:shadow-xl transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center font-black text-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    {r.receiverBizName[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">{r.receiverBizName}</h3>
                      <Badge className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 font-black uppercase text-[9px] tracking-widest">{r.dealType}</Badge>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic mb-1">"{r.message}"</p>
                    {r.summary && (
                      <p className="text-xs font-medium text-slate-400 mt-1">Opportunity: {r.summary}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">
                      <Clock className="h-3 w-3" /> Sent {timeAgo(r.createdAt)}
                    </div>
                    {r.status === "rejected" && (
                      <p className="mt-3 text-xs font-medium text-red-500">This request was declined.</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* ACCEPTED TAB */}
        <TabsContent value="accepted" className="space-y-4">
          {acceptedRequests.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No Connections Yet" subtitle="Accepted requests will appear here with your connection tokens." />
          ) : (
            acceptedRequests.map(r => {
              const isSender = r.senderId === user?._id
              const partnerName = isSender ? r.receiverBizName : r.senderBizName
              return (
                <div key={r._id} className="p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 group hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500">
                  <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center font-black text-2xl text-emerald-500 shrink-0">
                      {partnerName[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">{partnerName}</h3>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-black uppercase text-[9px] tracking-widest">Connected</Badge>
                        <Badge className="bg-slate-100 dark:bg-white/5 text-slate-400 font-black uppercase text-[9px] tracking-widest">{isSender ? "Sent by you" : "Received"}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic mb-4">"{r.message}"</p>
                      {r.connectionToken && (
                        <ConnectionTokenCard token={r.connectionToken} partnerName={partnerName} />
                      )}
                      {/* Rate Partner button */}
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="h-10 px-5 rounded-xl border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest text-[9px] hover:bg-amber-50 dark:hover:bg-amber-900/10 flex items-center gap-2 transition-all"
                          onClick={() => setFeedbackTarget({ partnerName, connectionToken: r.connectionToken || "" })}
                        >
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Rate Partner
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Feedback Modal from Accepted tab */}
      {feedbackTarget && (
        <FeedbackModal
          open={!!feedbackTarget}
          onClose={() => setFeedbackTarget(null)}
          connectionId={feedbackTarget.connectionToken}
          partnerName={feedbackTarget.partnerName}
          onSubmitted={() => setFeedbackTarget(null)}
        />
      )}
    </div>
  )
}

