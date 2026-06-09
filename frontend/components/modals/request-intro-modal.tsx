"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Building2, MessageSquare, Target, Banknote, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface RequestIntroModalProps {
  open: boolean
  onClose: () => void
  company: {
    id: string | number
    name: string
    industry?: string
    verified?: boolean
    matchScore?: number
  }
}

const DEAL_TYPES = ["Client", "Partnership", "Vendor", "Investment", "Collaboration", "Supplier"]

export function RequestIntroModal({ open, onClose, company }: RequestIntroModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<"form" | "success" | "error">("form")
  const [message, setMessage] = useState("")
  const [dealType, setDealType] = useState("")
  const [summary, setSummary] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async () => {
    if (!message.trim() || !dealType) return
    if (!user?._id) {
      toast.error("You must be logged in to send a request.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg("")

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user._id,
          receiverId: company.id,
          dealType,
          message,
          summary,
          matchScore: company.matchScore || 0,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStep("success")
      } else if (res.status === 409) {
        setErrorMsg("You already have a pending request with this company.")
        setStep("error")
      } else {
        setErrorMsg(data.msg || "Something went wrong. Please try again.")
        setStep("error")
      }
    } catch (err) {
      setErrorMsg("Network error. Please check your connection.")
      setStep("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep("form")
    setMessage("")
    setDealType("")
    setSummary("")
    setErrorMsg("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[520px] rounded-[2rem] p-0 gap-0 border-none shadow-2xl overflow-hidden bg-white dark:bg-[#0A0A0A]">
        <DialogTitle className="sr-only">Request Intro</DialogTitle>

        {step === "form" ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-2xl text-primary shadow-sm">
                  {company.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white">{company.name}</h2>
                    {company.verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  {company.industry && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {company.industry}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Deal Type */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Target className="h-3 w-3" /> Deal Type *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEAL_TYPES.map(dt => (
                    <button
                      key={dt}
                      onClick={() => setDealType(dt)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        dealType === dt
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                          : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 hover:border-primary/30"
                      }`}
                    >
                      {dt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Your Message *
                </label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you'd like to connect..."
                  className="min-h-[100px] bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-medium rounded-xl resize-none text-sm"
                />
              </div>

              {/* Opportunity Summary */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Banknote className="h-3 w-3" /> Opportunity Summary <span className="text-slate-300 dark:text-white/20">(optional)</span>
                </label>
                <Textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Briefly describe the opportunity or deal scope..."
                  className="min-h-[72px] bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-medium rounded-xl resize-none text-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || !dealType || isSubmitting}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <><Send className="h-4 w-4" /> Send Request</>
                )}
              </Button>
            </div>
          </div>
        ) : step === "success" ? (
          // Success State
          <div className="p-10 flex flex-col items-center text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white mb-2">Request Sent!</h2>
              <p className="text-slate-500 dark:text-white/40 font-medium text-sm">
                Your intro request has been sent to <span className="font-black text-slate-900 dark:text-white">{company.name}</span>.<br />
                You'll be notified once they respond.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none font-black uppercase text-[9px] tracking-widest px-3 py-1.5">
                {dealType}
              </Badge>
              <Badge className="bg-amber-500/10 text-amber-600 border-none font-black uppercase text-[9px] tracking-widest px-3 py-1.5">
                Pending Response
              </Badge>
            </div>
            <Button onClick={handleClose} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px]">
              Done
            </Button>
          </div>
        ) : (
          // Error State
          <div className="p-10 flex flex-col items-center text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white mb-2">Request Failed</h2>
              <p className="text-slate-500 dark:text-white/40 font-medium text-sm">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10">
                Close
              </Button>
              <Button onClick={() => setStep("form")} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px]">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
