"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, MessageSquare, Handshake, ShieldCheck } from "lucide-react"

const steps = [
  {
    icon: Zap,
    title: "Post Intent",
    description: "Clearly state what you are looking for or offering. Our engine processes the context instantly.",
  },
  {
    icon: MessageSquare,
    title: "Request Intro",
    description: "Connect with high-score matches. We verify both parties to ensure serious intent.",
  },
  {
    icon: Handshake,
    title: "Execute Deal",
    description: "Use our secure environment to share documents, hold meetings, and finalize terms.",
  },
  {
    icon: ShieldCheck,
    title: "Rate & Review",
    description: "Build your trust score by successfully completing deals and rating your experience.",
  }
]

export function DealFlow() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge className="bg-primary/10 text-primary border-none mb-6 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            End-to-End Execution
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
            The <span className="text-primary italic">Deal Flow</span> Lifecycle.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            From the first spark of intent to the final handshake. Taplyzer streamlines every step of the business transaction.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-12 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 dark:bg-white/5 -z-10" />
          
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-3xl bg-white dark:bg-white/5 shadow-xl flex items-center justify-center mb-8 relative group hover:scale-110 transition-transform duration-300">
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg">
                  {index + 1}
                </div>
                <step.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 p-8 rounded-3xl bg-primary text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20">
          <div className="max-w-xl">
            <h4 className="text-2xl font-black mb-2 tracking-tight">Ready to close your next big deal?</h4>
            <p className="text-white/80 font-medium">Join 5,000+ businesses already using Taplyzer to find strategic partners.</p>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="h-12 w-12 text-white/40" />
            <div className="flex flex-col">
              <span className="text-2xl font-black">94%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Match Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
