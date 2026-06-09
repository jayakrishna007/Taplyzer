"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, ArrowRight } from "lucide-react"
import Link from "next/link"

const profileSteps = [
  { name: "Basic Information", completed: true },
  { name: "Business Details", completed: true },
  { name: "What You Offer", completed: true },
  { name: "What You Need", completed: false },
  { name: "Verification", completed: false },
]

export function ProfileProgress() {
  const completedSteps = profileSteps.filter((step) => step.completed).length
  const progressPercentage = Math.round((completedSteps / profileSteps.length) * 100)

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-7 shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Profile Completion</h3>
        <span className="text-3xl font-black text-primary tracking-tighter shadow-sm">{progressPercentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-8 border border-slate-200 dark:border-white/5">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(3,169,244,0.4)]"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-8">
        {profileSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 drop-shadow-[0_0_5px_rgba(3,169,244,0.3)]" />
            ) : (
              <Circle className="h-5 w-5 text-slate-200 dark:text-white/10 shrink-0" />
            )}
            <span className={`text-xs font-bold uppercase tracking-wider ${step.completed ? "text-slate-700 dark:text-white/80" : "text-slate-300 dark:text-white/20"}`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>

      <Link href="/dashboard/profile">
        <Button variant="outline" className="w-full h-11 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl font-bold gap-2 transition-all">
          Complete Profile
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
