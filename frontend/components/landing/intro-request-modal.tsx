"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Send, Building2, Sparkles } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface IntroRequestModalProps {
  isOpen: boolean
  onClose: () => void
  businessName: string
}

export function IntroRequestModal({ isOpen, onClose, businessName }: IntroRequestModalProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    toast.success(`Introduction request sent to ${businessName}!`, {
      description: "They will be notified immediately of your intent.",
    })
    setMessage("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/10 rounded-[32px] p-8 outline-none shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Request Introduction
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest mt-1">
              To: {businessName}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-1">
              Personalize Your Outreach
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in discussing a potential partnership regarding..."
              className="w-full h-32 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none font-medium"
            />
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 dark:text-blue-400/70 font-medium leading-relaxed">
              Pro tip: Mention a specific deal value or project timeline to increase your acceptance rate by 45%.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black rounded-xl transition-all uppercase tracking-widest text-[10px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex-[2] h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-[0_0_20px_rgba(3,169,244,0.3)] flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
            >
              Send Request
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
