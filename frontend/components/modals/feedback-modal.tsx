"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const QUICK_TAGS = [
  "Good Communication",
  "Serious Buyer",
  "Closed Deal",
  "Time Waster",
  "Didn't Show Up",
  "Not Relevant",
  "Fast Response",
  "Professional",
]

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
  meetingId?: string
  connectionId?: string
  partnerName: string
  onSubmitted?: () => void
}

export function FeedbackModal({ open, onClose, meetingId, connectionId, partnerName, onSubmitted }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [communication, setCommunication] = useState("")
  const [reliability, setReliability] = useState("")
  const [dealSeriousness, setDealSeriousness] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dealClosed, setDealClosed] = useState<boolean | null>(null)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating")
      return
    }
    if (meetingId && dealClosed === null) {
      toast.error("Please specify if a deal was closed")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(meetingId ? { meetingId } : { connectionId }),
          rating,
          tags: selectedTags,
          communication,
          reliability,
          dealSeriousness,
          comment,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        if (meetingId && dealClosed !== null) {
          try {
            await fetch("/api/meetings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                meetingId,
                outcome: dealClosed ? "deal" : "no_deal"
              }),
            })
          } catch (err) {
            console.error("Failed to update meeting outcome:", err)
          }
        }
        setSubmitted(true)
        toast.success("Feedback submitted!")
        onSubmitted?.()
      } else {
        toast.error(data.error || "Failed to submit feedback")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRating(0); setHovered(0); setSelectedTags([]); setCommunication("")
    setReliability(""); setDealSeriousness(""); setComment(""); setSubmitted(false)
    setDealClosed(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/10 rounded-[2rem] max-w-lg w-full p-8 shadow-2xl">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Feedback Sent!</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-white/40 max-w-xs">
              Your feedback helps build trust across the Taplyzer network. Thank you.
            </p>
            <Button
              onClick={handleClose}
              className="h-11 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl mt-2"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">
                Rate Your Meeting
              </DialogTitle>
              <p className="text-xs font-medium text-slate-400 mt-1">
                How was your experience with <span className="font-black text-slate-700 dark:text-white">{partnerName}</span>?
              </p>
            </DialogHeader>

            <div className="space-y-6">
              {/* Star Rating */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Overall Rating</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`h-9 w-9 transition-colors ${
                          s <= (hovered || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 dark:text-white/10"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-sm font-black text-slate-900 dark:text-white ml-2">
                      {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Tags */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Quick Tags</span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                          : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 hover:border-primary/40"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Structured Dimensions */}
              <div className="grid grid-cols-3 gap-3">
                {/* Communication */}
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Communication</span>
                  <div className="flex flex-col gap-1">
                    {["Good", "Average", "Poor"].map(v => (
                      <button
                        key={v}
                        onClick={() => setCommunication(communication === v ? "" : v)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                          communication === v
                            ? "bg-primary text-white border-primary"
                            : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary/30"
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                </div>

                {/* Reliability */}
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Reliability</span>
                  <div className="flex flex-col gap-1">
                    {["High", "Medium", "Low"].map(v => (
                      <button
                        key={v}
                        onClick={() => setReliability(reliability === v ? "" : v)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                          reliability === v
                            ? "bg-primary text-white border-primary"
                            : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary/30"
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                </div>

                {/* Deal Seriousness */}
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Deal Seriousness</span>
                  <div className="flex flex-col gap-1">
                    {["Strong", "Weak"].map(v => (
                      <button
                        key={v}
                        onClick={() => setDealSeriousness(dealSeriousness === v ? "" : v)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                          dealSeriousness === v
                            ? "bg-primary text-white border-primary"
                            : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary/30"
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deal Outcome (Only if meetingId is provided) */}
              {meetingId && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                    Did you close a deal during this meeting?
                  </span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setDealClosed(true)}
                      className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        dealClosed === true
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                          : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 hover:border-emerald-500/40"
                      }`}
                    >
                      Yes, Deal Closed
                    </button>
                    <button
                      type="button"
                      onClick={() => setDealClosed(false)}
                      className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        dealClosed === false
                          ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20"
                          : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 hover:border-rose-500/40"
                      }`}
                    >
                      No Deal
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Comment */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Comment (Optional)</span>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Brief experience with this business..."
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium resize-none h-20 focus:ring-1 ring-primary"
                  maxLength={300}
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={loading || rating === 0 || (!!meetingId && dealClosed === null)}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
