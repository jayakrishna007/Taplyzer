import { Button } from "@/components/ui/button"
import { Building2, Clock, ArrowUpRight, MessageSquare, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"

export function IntroRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/requests/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setRequests((data.received || []).filter((r: any) => r.status === "pending").slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id])

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests])

  const handleAction = async (requestId: string, action: "accept" | "reject", partnerName: string) => {
    setActionLoading(requestId + action)
    try {
      const res = await fetch(`/api/requests/${requestId}/${action}`, {
        method: "PATCH",
      })
      if (res.ok) {
        if (action === "accept") {
          toast.success(`Connected with ${partnerName}! 🎉`)
        } else {
          toast.info(`Request from ${partnerName} declined.`)
        }
        await fetchRequests()
      } else {
        toast.error("Action failed. Please try again.")
      }
    } catch {
      toast.error("Network error.")
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-7 shadow-xl h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-7 shadow-xl transition-colors h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Pending Requests</h3>
        {requests.length > 0 && (
          <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full border border-primary/20 uppercase tracking-widest shadow-[0_0_10px_rgba(3,169,244,0.1)]">
            {requests.length} new
          </span>
        )}
      </div>

      <div className="flex-grow space-y-4">
        {requests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 text-center opacity-40">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No requests yet</p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Your networking activity will appear here.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request._id}
              className="flex flex-col gap-3 p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/10 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  {request.senderBizName?.[0] || <Building2 className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{request.senderBizName}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0">
                      {request.dealType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-1 line-clamp-1 font-medium italic">
                    &quot;{request.message}&quot;
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 dark:text-white/20 font-bold uppercase tracking-wider">
                    <Clock className="h-3 w-3" />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-white/10 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-all"
                  disabled={actionLoading !== null}
                  onClick={() => handleAction(request._id, "reject", request.senderBizName)}
                >
                  {actionLoading === request._id + "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <><X className="h-3 w-3 mr-1" />Reject</>}
                </Button>
                <Button
                  className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
                  disabled={actionLoading !== null}
                  onClick={() => handleAction(request._id, "accept", request.senderBizName)}
                >
                  {actionLoading === request._id + "accept" ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3 mr-1" />Accept</>}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Link href="/requests" className="block w-full mt-6">
        <Button variant="ghost" className="w-full h-11 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl font-bold transition-all flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4" /> View All Requests
        </Button>
      </Link>
    </div>
  )
}
