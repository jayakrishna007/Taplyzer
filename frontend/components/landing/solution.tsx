"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, Check } from "lucide-react"

const OFFERINGS = [
  "Performance Marketing",
  "SaaS Software",
  "Web Development",
  "Logistics Services",
  "AI Automation"
]

const NEEDS = [
  "New Clients",
  "Agency Partners",
  "SaaS Buyers",
  "Vendors",
  "Growth Opportunities"
]

const SIMULATED_MATCHES: Record<string, Array<{ name: string; type: string; score: number; desc: string }>> = {
  "Performance Marketing+New Clients": [
    { name: "Apex D2C Apparel", type: "D2C Brand", score: 98, desc: "Looking for an agency to scale paid ads to $500k MRR." },
    { name: "VitaGlow Nutra", type: "E-commerce", score: 92, desc: "Seeking performance media buying partner for Q3 rollout." }
  ],
  "SaaS Software+New Clients": [
    { name: "Alpha Consulting", type: "Enterprise Service", score: 96, desc: "Seeking streamlined CRM and pipeline automation tool." },
    { name: "Vortex Logistics", type: "Logistics Hub", score: 91, desc: "Wants cloud inventory suite to manage fleet dispatching." }
  ],
  "Web Development+New Clients": [
    { name: "Quantum FinTech", type: "Startup", score: 95, desc: "Needs high-end Next.js front-end build and API integration." },
    { name: "Nova Wellness", type: "D2C Brand", score: 89, desc: "Migrating WooCommerce backend to Shopify Plus headless build." }
  ],
  "Logistics Services+New Clients": [
    { name: "FreshCart Produce", type: "E-commerce", score: 97, desc: "Needs nationwide cold-chain fulfillment and custom API sync." },
    { name: "Prime Tech Gear", type: "Hardware Retailer", score: 90, desc: "Seeking cross-docking and shipping partner in Western Region." }
  ],
  "AI Automation+New Clients": [
    { name: "Zeta Support Corp", type: "Enterprise Service", score: 99, desc: "Wants custom LLM-based customer service agents and workflows." },
    { name: "Lumina Creators", type: "Media Network", score: 94, desc: "Seeking automated media distribution and metadata tagging engine." }
  ],
  // Fallback for general matches
  "default": [
    { name: "Global Trade Inc", type: "B2B Brand", score: 94, desc: "Looking for verified operational partners to expand distribution." },
    { name: "Stellar Creative", type: "Agency Partner", score: 90, desc: "Seeking reciprocal SaaS buyer integrations and vendor intro paths." }
  ]
}

export function Solution() {
  const [selectedOffer, setSelectedOffer] = useState(OFFERINGS[0])
  const [selectedNeed, setSelectedNeed] = useState(NEEDS[0])
  const [isMatching, setIsMatching] = useState(false)
  const [showResult, setShowResult] = useState(true)

  const handleSimulatedMatch = () => {
    setIsMatching(true)
    setTimeout(() => {
      setIsMatching(false)
      setShowResult(true)
    }, 800)
  }

  const activeKey = `${selectedOffer}+${selectedNeed}`
  const matchesToDisplay = SIMULATED_MATCHES[activeKey] || SIMULATED_MATCHES[activeKey.replace(/\+.*/, "+New Clients")] || SIMULATED_MATCHES["default"]

  return (
    <section id="solution" className="relative py-24 lg:py-32 bg-slate-50 dark:bg-zinc-950 transition-colors overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 z-10 relative">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black mb-6 uppercase tracking-widest">
            <Sparkles className="h-4 w-4 shrink-0" />
            The Solution
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance leading-tight">
            What If You Could Skip The Search?
          </h2>
          <p className="mt-6 text-lg text-slate-500 dark:text-white/50 font-semibold max-w-2xl mx-auto leading-relaxed">
            Instead of reaching out to hundreds of random businesses, Taplyzer helps you discover businesses already looking for what you offer.
          </p>
        </div>

        {/* Playground Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Interactive Selector Panel */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0A0A0E] border border-slate-200 dark:border-white/5 rounded-[32px] p-6 sm:p-8 shadow-xl dark:shadow-none backdrop-blur-xl">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
              Interactive Alignment Playground
            </h3>
            
            {/* Step A: What You Offer */}
            <div className="mb-6">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest block mb-3">
                1. What You Offer
              </span>
              <div className="flex flex-wrap gap-2.5">
                {OFFERINGS.map((offer) => (
                  <button
                    key={offer}
                    onClick={() => {
                      setSelectedOffer(offer)
                      handleSimulatedMatch()
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      selectedOffer === offer
                        ? "bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-[1.02]"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-white/50 hover:border-blue-500/25 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {selectedOffer === offer && <Check className="h-3.5 w-3.5" />}
                    {offer}
                  </button>
                ))}
              </div>
            </div>

            {/* Step B: What You Need */}
            <div className="mb-8">
              <span className="text-xs font-black text-emerald-500 uppercase tracking-widest block mb-3">
                2. What You Need
              </span>
              <div className="flex flex-wrap gap-2.5">
                {NEEDS.map((need) => (
                  <button
                    key={need}
                    onClick={() => {
                      setSelectedNeed(need)
                      handleSimulatedMatch()
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      selectedNeed === need
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-white/50 hover:border-emerald-500/25 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {selectedNeed === need && <Check className="h-3.5 w-3.5" />}
                    {need}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-[11px] font-bold text-slate-400 dark:text-white/35 uppercase tracking-wider">
                Simulation updates dynamically on tap
              </p>
              <button 
                onClick={handleSimulatedMatch}
                className="inline-flex items-center gap-1 text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-wider group cursor-pointer"
              >
                Re-scan Matches 
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Simulated Outcome */}
          <div className="lg:col-span-6 flex flex-col justify-center h-full">
            <div className="mb-6">
              <span className="text-[10px] font-black text-slate-400 dark:text-white/35 uppercase tracking-widest block mb-1">
                TAPLYZER INTENT MATCH ENGINE OUTCOME
              </span>
              <p className="text-sm text-slate-500 dark:text-white/40 font-bold leading-normal">
                Our matching engine automatically identifies profiles with reciprocal intent compatibility and visualizes the top results instantly.
              </p>
            </div>

            {/* Dynamic Results Display */}
            <div className="relative min-h-[220px]">
              {isMatching ? (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-100/50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/10 rounded-[28px] animate-pulse">
                  <div className="h-10 w-10 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4" />
                  <span className="text-xs font-black text-slate-400 dark:text-white/35 uppercase tracking-wider">
                    Analyzing intent synergies...
                  </span>
                </div>
              ) : showResult ? (
                <div className="space-y-4 animate-fade-in">
                  {matchesToDisplay.map((match, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-emerald-500/25 transition-all shadow-md dark:shadow-none flex items-start justify-between gap-4 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight truncate">
                            {match.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-black text-slate-400 dark:text-white/40 uppercase tracking-wider">
                            {match.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-semibold">
                          {match.desc}
                        </p>
                        
                        <div className="mt-4 flex items-center gap-2 text-xs font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Offers matching what you need ({selectedNeed})
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex flex-col items-center justify-center p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                          {match.score}%
                        </span>
                        <span className="text-[7px] font-black text-emerald-500/80 uppercase tracking-widest mt-1">
                          MATCH
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
              <p className="text-xs text-slate-400 dark:text-white/35 font-bold uppercase tracking-wider">
                Reciprocal Intent matching removes the noise. You only talk to buyers and active strategic allies.
              </p>
            </div>
          </div>

        </div>

      </div>

    </section>
  )
}
