"use client"

import { Check, Clock, Calendar, MessageSquare, ShieldCheck, Trophy } from "lucide-react"

interface DealFlowStepperProps {
  status: "Pending" | "Accepted" | "Rejected" | "Scheduled" | "Won" | "Lost"
}

const STEPS = [
  { id: "pending", label: "Intro Requested", icon: MessageSquare, match: ["Pending"] },
  { id: "accepted", label: "Intro Accepted", icon: ShieldCheck, match: ["Accepted", "Scheduled", "Won", "Lost"] },
  { id: "scheduled", label: "Meeting Scheduled", icon: Calendar, match: ["Scheduled", "Won", "Lost"] },
  { id: "won", label: "Deal Won", icon: Trophy, match: ["Won"] },
]

export function DealFlowStepper({ status }: DealFlowStepperProps) {
  if (status === "Rejected" || status === "Lost") {
    return (
       <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
          Deal Terminated
       </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, index) => {
        const isCompleted = step.match.includes(status)
        const isCurrent = step.match[0] === status
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1 group relative">
               <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-300'}`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
               </div>
               
               {/* Tooltip */}
               <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl">
                    {step.label}
                  </div>
               </div>
            </div>
            
            {index < STEPS.length - 1 && (
               <div className={`w-8 h-0.5 mx-1 rounded-full ${isCompleted && STEPS[index+1].match.includes(status) ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-white/5'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
