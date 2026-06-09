"use client"

import { 
  Zap, ShieldCheck, Target, MessageSquare, 
  Rocket, Sparkles, TrendingUp, Users, 
  ArrowRight, Check, LayoutDashboard, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProductPage() {
  return (
    <div className="py-24 space-y-32">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          The Deal <span className="text-primary">Engine.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
          Taplyzer is the first strategic networking layer that transforms intent into verified deal flow.
        </p>
      </div>

      {/* Main Feature Blocks */}
      <div className="max-w-7xl mx-auto px-4 space-y-32">
         {/* Block 1 */}
         <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
               <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Search className="h-8 w-8" />
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-tight">Strategic Discovery.</h2>
               <p className="text-xl font-medium text-slate-500 italic leading-relaxed">
                  Our neural engine indexes thousands of businesses not by their name, but by their current strategic needs and offerings. Find the perfect partner before they even know they need you.
               </p>
               <div className="space-y-4">
                  {["Intent-based matching", "Real-time deal flow", "Neural alignment scores"].map(item => (
                    <div key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                       <Check className="h-4 w-4 text-primary" /> {item}
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-[4rem] aspect-square border border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center">
               <Sparkles className="h-32 w-32 text-primary opacity-20" />
            </div>
         </div>

         {/* Block 2 */}
         <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-8">
               <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8" />
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-tight">Verified Trust.</h2>
               <p className="text-xl font-medium text-slate-500 italic leading-relaxed">
                  Every company on Taplyzer undergoes a multi-factor verification process. We ensure you're talking to real decision-makers at legitimate, high-intent organizations.
               </p>
               <div className="space-y-4">
                  {["Official document vetting", "Social signal analysis", "Integrity ratings"].map(item => (
                    <div key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                       <Check className="h-4 w-4 text-emerald-500" /> {item}
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-[4rem] aspect-square border border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center">
               <ShieldCheck className="h-32 w-32 text-emerald-500 opacity-20" />
            </div>
         </div>

         {/* Block 3 */}
         <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
               <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <LayoutDashboard className="h-8 w-8" />
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-tight">Seamless Flow.</h2>
               <p className="text-xl font-medium text-slate-500 italic leading-relaxed">
                  Move from introduction to closed deal without leaving the platform. Our integrated scheduler and deal rooms keep your strategic conversations organized and moving forward.
               </p>
               <div className="space-y-4">
                  {["One-click intro requests", "Unified meeting scheduler", "Deal stage tracking"].map(item => (
                    <div key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                       <Check className="h-4 w-4 text-purple-500" /> {item}
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-[4rem] aspect-square border border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center">
               <LayoutDashboard className="h-32 w-32 text-purple-500 opacity-20" />
            </div>
         </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto text-center space-y-12 px-4 py-16">
         <div className="h-1 bg-slate-100 dark:bg-white/5 w-24 rounded-full mx-auto" />
         <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">Experience the next generation of B2B networking.</h2>
         <Link href="/auth?mode=signup">
            <Button className="h-20 px-16 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4">
               Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
         </Link>
      </div>
    </div>
  )
}
