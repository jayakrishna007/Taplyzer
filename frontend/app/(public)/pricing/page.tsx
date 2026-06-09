"use client"

import { Check, Zap, ShieldCheck, Target, Users, Globe, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for exploring and starting your networking journey.",
    features: [
      "Basic Profile",
      "5 Intro Requests / month",
      "Standard Match Feed",
      "Public Directory Access",
      "Community Support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$49",
    description: "For active deal-makers looking to scale their network.",
    features: [
      "Verified Badge",
      "Unlimited Intro Requests",
      "AI Match Recommendations",
      "Direct Meeting Scheduler",
      "Priority Verification",
      "Analytics Dashboard"
    ],
    cta: "Go Pro",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Bespoke solutions for large organizations and VC firms.",
    features: [
      "Multi-user Teams",
      "White-label Portals",
      "Dedicated Account Manager",
      "API Access",
      "Custom Data Insights",
      "Private Networking Events"
    ],
    cta: "Contact Sales",
    popular: false
  }
]

export default function PricingPage() {
  return (
    <div className="py-24 space-y-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic">
          Scalable <span className="text-primary">Pricing</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 leading-relaxed italic">
          Join the world's most elite B2B networking ecosystem. No hidden fees, just pure strategic value.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {PLANS.map(plan => (
          <div 
            key={plan.name} 
            className={`relative p-10 rounded-[3rem] border transition-all duration-500 hover:scale-[1.02] ${plan.popular ? 'bg-slate-900 dark:bg-primary border-slate-900 dark:border-primary shadow-2xl shadow-primary/20 scale-105 z-10' : 'bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/10 shadow-xl shadow-slate-100 dark:shadow-none'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 dark:text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                Most Popular
              </div>
            )}
            
            <div className="space-y-6">
               <div>
                  <h3 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${plan.popular ? 'text-white/60' : 'text-primary'}`}>{plan.name} Plan</h3>
                  <div className="flex items-baseline gap-1">
                     <span className={`text-5xl font-black italic tracking-tighter ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                     {plan.price !== 'Custom' && <span className={`text-sm font-bold ${plan.popular ? 'text-white/40' : 'text-slate-400'}`}>/mo</span>}
                  </div>
               </div>
               
               <p className={`text-sm font-medium leading-relaxed ${plan.popular ? 'text-white/60' : 'text-slate-500'}`}>{plan.description}</p>
               
               <div className="pt-6 border-t border-white/10 space-y-4">
                  {plan.features.map(feat => (
                    <div key={feat} className="flex items-center gap-3">
                       <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                          <Check className="h-3 w-3" />
                       </div>
                       <span className={`text-xs font-black uppercase tracking-widest ${plan.popular ? 'text-white/80' : 'text-slate-700 dark:text-slate-300'}`}>{feat}</span>
                    </div>
                  ))}
               </div>

               <Link href="/auth?mode=signup" className="block pt-8">
                  <Button className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all ${plan.popular ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-white/10' : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105'}`}>
                     {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
               </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Quote */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
         <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-12 border border-slate-100 dark:border-white/5">
            <h2 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white mb-6">"Taplyzer transformed how we handle strategic outreach. The Pro plan paid for itself in the first week."</h2>
            <div className="flex items-center justify-center gap-4">
               <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
               <div className="text-left">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Sarah Jenkins</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CEO, Elevate Marketing</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
