"use client"

import { 
  Zap, ShieldCheck, Target, Users, BarChart3, 
  MessageSquare, Calendar, Globe, Sparkles, Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const FEATURES = [
  {
    title: "AI Match Discovery",
    desc: "Our neural engine scans thousands of business intents to find the top 1% alignment for your specific needs.",
    icon: Sparkles,
    color: "bg-blue-500"
  },
  {
    title: "Verified Trust Network",
    desc: "Multi-factor business verification ensures you only connect with legitimate, high-intent organizations.",
    icon: ShieldCheck,
    color: "bg-emerald-500"
  },
  {
    title: "Intent Tracking",
    desc: "Real-time deal flow monitoring. Know exactly when a partner is ready to engage in your specific deal type.",
    icon: Target,
    color: "bg-primary"
  },
  {
    title: "Direct Intro Requests",
    desc: "Skip the cold emails. Request introductions directly from the dashboard and get responses within hours.",
    icon: MessageSquare,
    color: "bg-purple-500"
  },
  {
    title: "Unified Scheduler",
    desc: "Seamlessly move from introduction to video call. Integrated calendar for zero-friction deal making.",
    icon: Calendar,
    color: "bg-amber-500"
  },
  {
    title: "Growth Analytics",
    desc: "Deep insights into your networking performance, match velocity, and strategic outreach success rates.",
    icon: BarChart3,
    color: "bg-slate-900"
  }
]

export default function FeaturesPage() {
  return (
    <div className="py-24 space-y-32">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
           <Zap className="h-3 w-3 fill-primary" /> The Future of B2B
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          Platform <span className="text-primary">Capabilities.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic">
          Everything you need to discover, verify, and close strategic business partnerships at global scale.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map(feat => (
          <div key={feat.title} className="group p-10 rounded-[3rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all duration-500 shadow-xl shadow-slate-100/50 dark:shadow-none hover:shadow-2xl hover:shadow-primary/5">
             <div className={`h-16 w-16 rounded-[1.5rem] ${feat.color} text-white flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feat.icon className="h-8 w-8" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight mb-4">{feat.title}</h3>
             <p className="text-slate-500 font-medium leading-relaxed italic">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4">
         <div className="bg-slate-900 dark:bg-primary rounded-[4rem] p-12 md:p-24 overflow-hidden relative shadow-2xl shadow-primary/30">
            <div className="absolute top-0 right-0 p-24 opacity-10 rotate-12 scale-150">
               <Rocket className="h-96 w-96 text-white" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-10 text-center md:text-left">
               <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-tight">Ready to activate your strategic network?</h2>
               <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link href="/auth?mode=signup">
                    <Button className="h-16 px-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-xs shadow-xl">
                       Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="h-16 px-12 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs">
                       View Pricing
                    </Button>
                  </Link>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
