"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Briefcase, Zap, CheckCircle2, User, Target } from "lucide-react"
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
}

interface MatchCardProps {
  match: Match
  onRequestIntro: (id: string) => void
  onViewProfile?: (match: Match) => void
}

export function MatchCard({ match, onRequestIntro, onViewProfile }: MatchCardProps) {
  return (
    <Card className="group relative bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
      <CardContent className="p-5 md:p-8">

        {/* Score Badge — top right on mobile */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:bg-primary transition-all duration-500 relative flex-shrink-0">
              <span className="text-2xl font-black text-primary group-hover:text-white transition-colors">{(match.companyName || match.candidateName || 'T')[0]}</span>
              {match.verified && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-lg">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}
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

          {/* Score */}
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Zap className="h-4 w-4 text-primary fill-primary" />
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white italic">{match.score}%</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Match Score</span>
          </div>
        </div>

        {/* Score Breakdown (v3.1) */}
        {match.scoreBreakdown && (() => {
          const isV3_1 = match.scoreBreakdown.aNeedsMetByBOffers !== undefined || match.scoreBreakdown.profileCompleteness !== undefined;
          
          const intentVal = isV3_1 
            ? (match.scoreBreakdown.aNeedsMetByBOffers ?? 0) + 
              (match.scoreBreakdown.bNeedsMetByAOffers ?? 0)
            : (match.scoreBreakdown.intentMatch ?? match.scoreBreakdown.intentRelevance ?? 0) + (match.scoreBreakdown.semantic ?? 0);
            
          const intentMax = isV3_1 ? 90 : 50;
          
          const locVal = isV3_1 ? (match.scoreBreakdown.locationProximity ?? 0) : (match.scoreBreakdown.location ?? 0);
          const locMax = isV3_1 ? 5 : 15;
          
          const trustVal = isV3_1
            ? (match.scoreBreakdown.verification ?? 0)
            : (match.scoreBreakdown.verification ?? 0);
          const trustMax = 5;

          return (
            <div className="mb-4 space-y-3 px-1">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Intent", val: intentVal, max: intentMax, color: "bg-primary" },
                  { label: "Location", val: locVal, max: locMax, color: "bg-blue-500" },
                  { label: "Trust", val: trustVal, max: trustMax, color: "bg-emerald-500" },
                ].map(signal => {
                  const percentage = signal.max > 0 ? Math.round((signal.val / signal.max) * 100) : 0;
                  return (
                    <div key={signal.label} className="space-y-1">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
                        <span>{signal.label}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${signal.color} transition-all duration-1000`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {isV3_1 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-white/5 pt-2.5 transition-all">
                  <div className="flex justify-between items-center">
                    <span>🎯 Needs Met (A):</span>
                    <span className="font-extrabold text-primary">{match.scoreBreakdown.aNeedsMetByBOffers}/80</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🤝 Needs Met (B):</span>
                    <span className="font-extrabold text-slate-600 dark:text-slate-300">{match.scoreBreakdown.bNeedsMetByAOffers}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>📍 Location:</span>
                    <span className="font-extrabold text-blue-500">{match.scoreBreakdown.locationProximity}/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🛡️ Verification:</span>
                    <span className="font-extrabold text-emerald-500">{match.scoreBreakdown.verification}/5</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
