"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ShieldCheck,
  Send, 
  Target, 
  Zap, 
  X,
  Compass
} from "lucide-react"
import { type Match } from "@/components/dashboard/match-card"

interface ViewProfileModalProps {
  open: boolean
  onClose: () => void
  match: Match | null
  onRequestIntro: () => void
}

export function ViewProfileModal({ open, onClose, match, onRequestIntro }: ViewProfileModalProps) {
  if (!match) return null

  // Generate a premium gradient avatar color based on the company name
  const getGradientClass = (name: string) => {
    const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const gradients = [
      "from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500",
      "from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-400",
      "from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500",
      "from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400",
      "from-fuchsia-600 to-pink-500 dark:from-fuchsia-500 dark:to-pink-400"
    ]
    return gradients[charCodeSum % gradients.length]
  }

  // Map verification statuses to badges
  const renderVerificationBadge = (status?: string) => {
    if (status === "Trusted Partner") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
          <ShieldCheck className="h-3 w-3" /> Trusted Partner
        </Badge>
      )
    }
    if (status === "Business Verified" || match.verified) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> Verified Business
        </Badge>
      )
    }
    return (
      <Badge className="bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
        Basic Partner
      </Badge>
    )
  }

  const initials = (match.companyName || match.candidateName || "U").substring(0, 2).toUpperCase()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-0 gap-0 border-none shadow-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">View Profile - {match.companyName || match.candidateName}</DialogTitle>

        {/* Modal Header Card (Logo, Company Name, Industry, Location, Team Size, Verification) */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 relative flex-shrink-0">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left mt-2">
            
            {/* Logo initials container */}
            <div className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-gradient-to-br ${getGradientClass(match.companyName || match.candidateName || "")} flex items-center justify-center text-white font-black text-2xl md:text-3xl tracking-tight shadow-md flex-shrink-0 relative`}>
              {initials}
              {match.score && (
                <div className="absolute -bottom-2 -right-2 bg-primary border-2 border-white dark:border-[#0A0A0A] text-white font-black text-[10px] italic h-7 w-7 rounded-full flex items-center justify-center shadow-lg">
                  {match.score}%
                </div>
              )}
            </div>

            <div className="space-y-2 flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl md:text-2xl font-black italic tracking-tight text-slate-900 dark:text-white leading-tight">
                  {match.companyName || match.candidateName}
                </h2>
                <div className="flex justify-center sm:justify-start">
                  {renderVerificationBadge(match.verificationStatus)}
                </div>
              </div>

              {/* Metadata details (Industry, Location, Employees) */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-white/40">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>{match.industry || "Not Specified"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span>{match.location || "Remote"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{match.teamSize || "1-5"} Employees</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-grow">
          
          {/* Middle Card: Goal / Intent / Looking For */}
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" /> Current Goal & Focus
            </h3>
            <div className="p-5 rounded-2xl border border-primary/10 bg-primary/[0.02] dark:border-primary/20 dark:bg-primary/[0.04] relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
              <p className="text-sm font-medium leading-relaxed italic text-slate-700 dark:text-slate-300 pl-2">
                "{match.offeringGoal || match.goal || 'Looking for business opportunities and synergistic growth.'}"
              </p>
            </div>
          </div>

          {/* Bottom Card: Offerings & Needs */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
            
            {/* Offerings list */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-emerald-500" /> Services & Offerings
              </span>
              <div className="flex flex-wrap gap-1.5">
                {match.offerings && match.offerings.length > 0 ? (
                  match.offerings.map((off) => (
                    <Badge 
                      key={off} 
                      variant="outline" 
                      className="text-[9px] font-bold tracking-wide bg-slate-50 border-slate-200 hover:border-primary/40 dark:bg-white/5 dark:border-white/10 dark:text-white/80 dark:hover:border-primary/40 px-3 py-1 rounded-xl transition-all"
                    >
                      {off}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None declared</span>
                )}
              </div>
            </div>

            {/* Needs list */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-blue-500" /> Looking For / Needs
              </span>
              <div className="flex flex-wrap gap-1.5">
                {match.needs && match.needs.length > 0 ? (
                  match.needs.map((need) => (
                    <Badge 
                      key={need} 
                      variant="outline" 
                      className="text-[9px] font-bold tracking-wide bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 px-3 py-1 rounded-xl transition-all"
                    >
                      {need}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None declared</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions (Cancel, Send Request / Request Intro) */}
        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex gap-3 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onClose()
              onRequestIntro()
            }}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
          >
            <Send className="h-4 w-4" /> Request Intro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
