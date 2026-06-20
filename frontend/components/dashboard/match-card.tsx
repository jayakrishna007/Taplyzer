"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Briefcase, Zap, CheckCircle2, User, Target, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import Link from "next/link"

export interface Match {
  matchedUserId: string
  candidateName: string
  companyName: string
  industry: string
  location: string
  score: number
  offerings: string[]
  needs: string[]
  goal: string
  offeringGoal?: string
  reasons: string[]
  verified: boolean
  scoreBreakdown?: {
    intentRelevance: number
    intentMatch?: number
    semantic?: number
    location: number
    verification: number
    reputation: number
    profileQuality: number
    subscriptionBonus: number
    // TargetedSynergy-v3.1 detailed metrics:
    aNeedsMetByBOffers?: number
    aGoalSatisfiedByBOffers?: number
    bNeedsMetByAOffers?: number
    bGoalSatisfiedByAOffers?: number
    locationProximity?: number
    profileCompleteness?: number
  }
  teamSize?: string
  verificationStatus?: string
  subscriptionPlan?: string
  goalType?: string
  goalIndustry?: string
}

interface MatchCardProps {
  match: Match
  onRequestIntro: (id: string) => void
  onViewProfile?: (match: Match) => void
}

export function MatchCard({ match, onRequestIntro, onViewProfile }: MatchCardProps) {
  const renderVerificationBadge = (status?: string) => {
    const isVerified = ["Verified", "Business Verified", "Trusted Partner", "Basic Verified"].includes(status || "") || match.verified
    if (isVerified) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
          <ShieldCheck className="h-3 w-3" /> Verified
        </Badge>
      )
    }
    return (
      <Badge className="bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
        Not Verified
      </Badge>
    )
  }

  return (
    <Card className="group relative bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
      <CardContent className="p-5 md:p-8">

        {/* Score Badge — top right on mobile */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:bg-primary transition-all duration-500 relative flex-shrink-0">
              <span className="text-2xl font-black text-primary group-hover:text-white transition-colors">{(match.companyName || match.candidateName || 'T')[0]}</span>
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white italic tracking-tight leading-tight">{match.companyName || match.candidateName}</h3>
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                <Briefcase className="h-2.5 w-2.5" /> {match.industry}
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <MapPin className="h-2.5 w-2.5" /> {match.location}
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0 flex flex-col items-end justify-center">
            {renderVerificationBadge(match.verificationStatus)}
          </div>
        </div>


        {/* Intent Box */}
        <div className="p-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Offering Goal</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-xs leading-relaxed italic mb-4">
            "{match.offeringGoal || match.goal || 'Looking for mutually beneficial business opportunities.'}"
          </p>

          <div className="grid grid-cols-1 gap-3 mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5">
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 w-full mb-1">Offerings:</span>
              {match.offerings && match.offerings.length > 0 ? match.offerings.map(off => (
                <Badge key={off} variant="outline" className="text-[8px] bg-slate-100 dark:bg-white/5">{off}</Badge>
              )) : <span className="text-xs text-slate-400">Not specified</span>}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 w-full mb-1">Needs:</span>
              {match.needs && match.needs.length > 0 ? match.needs.map(nd => (
                <Badge key={nd} variant="outline" className="text-[8px] bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">{nd}</Badge>
              )) : <span className="text-xs text-slate-400">Not specified</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-black rounded-xl uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 transition-all"
            onClick={() => onRequestIntro(match.matchedUserId)}
          >
            Request Intro
          </Button>
          {onViewProfile ? (
            <Button
              variant="outline"
              className="flex-1 h-10 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 font-black rounded-xl uppercase tracking-widest text-[9px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1"
              onClick={() => onViewProfile(match)}
            >
              <User className="h-3 w-3" />
              Profile
            </Button>
          ) : (
            <Link href={`/profile/${match.matchedUserId}`} className="flex-1">
              <Button
                asChild
                variant="outline"
                className="w-full h-10 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 font-black rounded-xl uppercase tracking-widest text-[9px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1"
              >
                <div>
                  <User className="h-3 w-3" />
                  Profile
                </div>
              </Button>
            </Link>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
