"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Building2, MapPin, BadgeCheck, Globe, Users, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BusinessProfileModalProps {
  isOpen: boolean
  onClose: () => void
  business: {
    name: string
    industry: string
    location: string
    score: number
    description: string
    verified: boolean
  } | null
}

export function BusinessProfileModal({ isOpen, onClose, business }: BusinessProfileModalProps) {
  if (!business) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/10 rounded-[32px] p-0 overflow-hidden outline-none">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white dark:bg-[#0A0A0A] rounded-2xl border-4 border-white dark:border-[#0A0A0A]">
            <div className="h-20 w-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {business.name}
                </DialogTitle>
                {business.verified && (
                  <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-500/10" />
                )}
              </div>
              <p className="text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                {business.industry}
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/10" />
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {business.location}
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                <span className="text-sm font-black text-primary">{business.score}% Match</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Employees</span>
              </div>
              <p className="font-black text-slate-900 dark:text-white">50-200</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 mb-1">
                <Globe className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Presence</span>
              </div>
              <p className="font-black text-slate-900 dark:text-white">Global</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Deal Type</span>
              </div>
              <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">Strategic Partner</p>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">About the Company</h4>
            <DialogDescription className="text-slate-500 dark:text-white/40 font-medium leading-relaxed">
              {business.description || "Leading provider of enterprise solutions with a focus on scalable infrastructure and data-driven insights. Looking to expand their market reach through strategic partnerships."}
            </DialogDescription>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex gap-4">
            <button className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(3,169,244,0.3)] uppercase tracking-widest text-xs">
              Go to Profile
            </button>
            <button 
              onClick={onClose}
              className="flex-1 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
