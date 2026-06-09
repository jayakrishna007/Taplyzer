"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, ShieldCheck, CheckCircle2 } from "lucide-react"

interface RateMeetingModalProps {
  open: boolean
  onClose: () => void
  meeting: any
}

export function RateMeetingModal({ open, onClose, meeting }: RateMeetingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    // Submit rating logic
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/10 rounded-[2.5rem]">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-white/5 p-8 border-b border-slate-100 dark:border-white/5 flex flex-col items-center text-center space-y-3">
          <DialogTitle className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white">
            Rate Your Experience
          </DialogTitle>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">
            How was your meeting with <span className="font-bold text-slate-900 dark:text-white">{meeting?.partner}</span>? Your feedback builds trust in the Taplyzer ecosystem.
          </p>
        </div>

        {/* Content */}
        {!submitted ? (
          <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Star Rating */}
            <div className="flex flex-col items-center gap-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Rating</span>
               <div className="flex items-center justify-center gap-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     onMouseEnter={() => setHoveredRating(star)}
                     onMouseLeave={() => setHoveredRating(0)}
                     onClick={() => setRating(star)}
                     className="p-1 transition-all"
                   >
                     <Star 
                        className={`h-10 w-10 transition-all ${
                          (hoveredRating || rating) >= star 
                            ? "fill-amber-400 text-amber-400 scale-110" 
                            : "text-slate-200 dark:text-white/10"
                        }`} 
                     />
                   </button>
                 ))}
               </div>
            </div>

            {/* Written Feedback */}
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Optional Feedback</label>
               <Textarea 
                 value={feedback}
                 onChange={(e) => setFeedback(e.target.value)}
                 placeholder="Share details about the professionalism, alignment, and outcome of the meeting..."
                 className="min-h-[120px] bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-medium p-5 resize-none"
               />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={rating === 0}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary text-white disabled:opacity-50"
              >
                Submit Rating
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white">Feedback Submitted</h3>
               <p className="text-sm font-medium text-slate-500">Thank you for strengthening the Taplyzer ecosystem.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
