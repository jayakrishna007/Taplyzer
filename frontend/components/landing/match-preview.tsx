"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { IntroRequestModal } from "./intro-request-modal"

const opportunities = [
  {
    lookingFor: "Performance Marketing Agency",
    industry: "Fashion D2C",
    location: "Mumbai, MH",
    budget: "$8,500/mo",
    status: "Active",
    needs: ["Scale Paid Instagram Ads", "Creative Direction", "Conversion Optimization"],
    offers: ["Premium Organic Apparel", "Strong Brand Authority", "Reliable Inventory Pipeline"],
    score: 96
  },
  {
    lookingFor: "CRM Implementation Partner",
    industry: "SaaS",
    location: "Bangalore, KA",
    budget: "$15,000 Contract",
    status: "Active",
    needs: ["Salesforce Architecture Setup", "HubSpot Data Migration", "Custom Pipeline API Integration"],
    offers: ["B2B SaaS Middleware Suite", "Established Customer Success team", "High Growth Tech Platform"],
    score: 93
  },
  {
    lookingFor: "Logistics Partner",
    industry: "E-commerce",
    location: "Delhi NCR",
    budget: "$5,000/mo Min",
    status: "Active",
    needs: ["Multi-warehouse Distribution", "Same-day Courier Integration", "Refrigerated Transit Channels"],
    offers: ["Quick Commerce Gourmet Grocery", "Rapid Daily Volume Growth", "High Lifetime Value (LTV) customer base"],
    score: 91
  }
]

export function MatchPreview() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [introBusiness, setIntroBusiness] = useState<string | null>(null)

  const handleRequestIntro = (e: React.MouseEvent, lookingFor: string) => {
    e.stopPropagation()
    if (isLoggedIn) {
      setIntroBusiness(lookingFor)
    } else {
      router.push("/auth?mode=signup")
    }
  }

  return (
    <section id="live-opportunities" className="relative py-24 lg:py-32 bg-slate-50 dark:bg-zinc-950 transition-colors overflow-hidden">
      
      {/* Decorative top border glow line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black mb-6 uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Live Marketplace
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance leading-tight">
            Discover What Businesses Are Looking For
          </h2>
          <p className="mt-6 text-lg text-slate-500 dark:text-white/50 font-semibold max-w-2xl mx-auto leading-relaxed">
            Real opportunities posted by active brands seeking reciprocal intent matches right now.
          </p>
        </div>

        {/* 3 Example Opportunity Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-white/5 rounded-[32px] p-6 sm:p-8 hover:border-blue-500/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group shadow-lg dark:shadow-none"
            >
              <div>
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block mb-1">
                      LOOKING FOR:
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-500 transition-colors">
                      {opp.lookingFor}
                    </h3>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {opp.status}
                  </div>
                </div>

                {/* Scope Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block mb-0.5">Industry</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white truncate block">{opp.industry}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block mb-0.5">Budget Focus</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate block">{opp.budget}</span>
                  </div>
                </div>

                {/* Subdetails List */}
                <div className="space-y-4 mb-8">
                  {/* What they need */}
                  <div>
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1.5">
                      INTENT MATCH REQUIRES (NEEDS)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.needs.map((n, i) => (
                        <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-white/60">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* What they offer */}
                  <div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1.5">
                      THEY RECIPROCATE WITH (OFFERS)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.offers.map((o, i) => (
                        <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400/80">
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest leading-none">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  {opp.location}
                </div>
                
                <Button
                  onClick={(e) => handleRequestIntro(e, opp.lookingFor)}
                  className="h-11 px-5 bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white text-slate-900 dark:text-white font-black rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-500 transition-all text-xs uppercase tracking-wider gap-1.5 group/btn cursor-pointer"
                  variant="outline"
                >
                  Request Intro
                  <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
              </div>

            </div>
          ))}
        </div>

      </div>

      <IntroRequestModal
        isOpen={!!introBusiness}
        onClose={() => setIntroBusiness(null)}
        businessName={introBusiness || ""}
      />

    </section>
  )
}
export { MatchPreview as LiveOpportunities }
