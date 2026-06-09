"use client"

import { 
  Zap, ShieldCheck, Target, MessageSquare, 
  Rocket, MousePointer2, Users, Search, 
  ArrowRight, ChevronRight, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STEPS = [
  {
    title: "Define Your Intent",
    desc: "Specify your business offerings, immediate needs, and strategic goals. Our AI uses this 'Intent Profile' as your strategic DNA.",
    icon: Target,
    color: "bg-blue-500",
    badges: ["Offerings", "Needs", "Strategic Goal"]
  },
  {
    title: "Discover Smart Matches",
    desc: "Skip the noise. Our engine identifies high-alignment businesses where their offers match your needs, and vice versa.",
    icon: Zap,
    color: "bg-primary",
    badges: ["AI Matching", "High Synergy", "Verified Hubs"]
  },
  {
    title: "Direct Introduction",
    desc: "Send a targeted intro request with a clear value proposition. Once accepted, move straight to the deal room.",
    icon: MessageSquare,
    color: "bg-emerald-500",
    badges: ["One-Click Intro", "Secure Flow", "Direct Response"]
  }
]

export default function HowItWorksPage() {
  return (
    <div className="py-24 space-y-32">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          The <span className="text-primary">Workflow.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
          From zero to partnership in three strategic steps. No cold outreach, just high-intent networking.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 space-y-32">
         {STEPS.map((step, index) => (
           <div key={step.title} className={`flex flex-col lg:flex-row items-center gap-16 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-8 text-center lg:text-left">
                 <div className={`h-20 w-20 rounded-[2rem] ${step.color} text-white flex items-center justify-center mx-auto lg:mx-0 shadow-2xl shadow-primary/20`}>
                    <step.icon className="h-10 w-10" />
                 </div>
                 <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Step 0{index + 1}</span>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-tight">{step.title}</h2>
                    <p className="text-xl font-medium text-slate-500 leading-relaxed italic">{step.desc}</p>
                 </div>
                 <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {step.badges.map(b => (
                      <div key={b} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                         {b}
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                 <div className="aspect-[4/3] bg-slate-50 dark:bg-white/5 rounded-[4rem] border border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    <div className="relative p-12 text-center space-y-6">
                       <MousePointer2 className="h-12 w-12 text-primary opacity-20 absolute top-10 right-10 animate-bounce" />
                       <div className="h-2 w-24 bg-primary/20 rounded-full mx-auto" />
                       <div className="h-2 w-16 bg-primary/10 rounded-full mx-auto" />
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto text-center space-y-12 px-4 py-16">
         <div className="h-0.5 bg-slate-100 dark:bg-white/5 w-full rounded-full" />
         <div className="space-y-6">
            <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">Ready to change how you do business?</h2>
            <Link href="/auth?mode=signup">
               <Button className="h-20 px-16 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4">
                  Launch Your Profile <ArrowRight className="h-5 w-5" />
               </Button>
            </Link>
         </div>
      </div>
    </div>
  )
}
