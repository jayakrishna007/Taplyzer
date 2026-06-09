"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, ArrowRightLeft, Sparkles, Calendar, CheckCircle } from "lucide-react"

interface MatchPair {
  id: number
  buyer: {
    name: string
    role: string
    need: string
    avatarColor: string
    avatarLetter: string
  }
  seller: {
    name: string
    role: string
    offers: string
    avatarColor: string
    avatarLetter: string
  }
  matchScore: number
  category: string
}

const MATCHES: MatchPair[] = [
  {
    id: 1,
    buyer: {
      name: "PixelCraft Agency",
      role: "Digital Design Studio",
      need: "AI Copywriting API Integration",
      avatarColor: "from-pink-500 to-rose-600",
      avatarLetter: "P",
    },
    seller: {
      name: "CopyGenie AI",
      role: "SaaS Enterprise API",
      offers: "Advanced LLM Copywriting",
      avatarColor: "from-cyan-400 to-blue-600",
      avatarLetter: "C",
    },
    matchScore: 98,
    category: "AI Marketing",
  },
  {
    id: 2,
    buyer: {
      name: "Vanguard Partners",
      role: "Consulting & Growth Firm",
      need: "Cold Outbound Automation",
      avatarColor: "from-purple-500 to-indigo-600",
      avatarLetter: "V",
    },
    seller: {
      name: "OutreachFlow",
      role: "SaaS Outreach System",
      offers: "AI-Powered Warm Outbound",
      avatarColor: "from-emerald-400 to-teal-600",
      avatarLetter: "O",
    },
    matchScore: 96,
    category: "B2B Sales",
  },
  {
    id: 3,
    buyer: {
      name: "DevStack Tech",
      role: "Software Solutions",
      need: "Dedicated Cloud Infrastructure",
      avatarColor: "from-amber-400 to-orange-500",
      avatarLetter: "D",
    },
    seller: {
      name: "NimbusCloud",
      role: "SaaS Hosting & Scaler",
      offers: "DevOps & Managed Clusters",
      avatarColor: "from-blue-500 to-indigo-700",
      avatarLetter: "N",
    },
    matchScore: 99,
    category: "Cloud Systems",
  },
]

export function MatchSimulator() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stage, setStage] = useState<"buyer" | "seller" | "matching" | "success">("buyer")

  useEffect(() => {
    // Sequence of animations:
    // 0s - 1.5s: Spotlight Buyer
    // 1.5s - 3s: Spotlight Seller
    // 3s - 4.5s: Laser connection & Central Orb processing
    // 4.5s - 7.5s: Match success modal fades in
    // 7.5s: Restart with next pair
    const interval = setInterval(() => {
      setStage((currentStage) => {
        if (currentStage === "buyer") return "seller"
        if (currentStage === "seller") return "matching"
        if (currentStage === "matching") return "success"
        
        // Go to next pair and reset stage
        setCurrentIndex((prev) => (prev + 1) % MATCHES.length)
        return "buyer"
      })
    }, 1800)

    return () => clearInterval(interval)
  }, [])

  const currentPair = MATCHES[currentIndex]

  return (
    <div className="relative w-full max-w-lg aspect-[4/3] bg-[#0c0c14]/40 border border-white/[0.05] rounded-3xl p-6 backdrop-blur-lg shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-between">
      
      {/* 1. Subtle Radial Glow behind central engine */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* 2. Top Header status bar */}
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-4 mb-4 select-none">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white/50 tracking-wider uppercase">
            Live Match Simulator
          </span>
        </div>
        <div className="px-2.5 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-[#2dd4bf]">
          {stage === "success" ? "Warm Intro Created" : "Evaluating Intent..."}
        </div>
      </div>

      {/* 3. Main Network Canvas (Interactive Layout) */}
      <div className="relative flex-1 flex items-center justify-between gap-2">
        
        {/* Animated connecting beams via absolute SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="beamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity={stage !== "buyer" ? 0.8 : 0.1} />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity={stage === "matching" || stage === "success" ? 1 : 0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={stage === "success" || stage === "seller" || stage === "matching" ? 0.8 : 0.1} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Left Connection Beam */}
          <path
            d="M 50,110 L 220,110"
            stroke="url(#beamGrad)"
            strokeWidth={stage === "matching" || stage === "success" ? "2.5" : "1"}
            strokeDasharray={stage === "matching" ? "8, 6" : "none"}
            className={stage === "matching" ? "animate-[laser-flow_1.5s_linear_infinite]" : ""}
            filter={stage === "matching" || stage === "success" ? "url(#glow)" : ""}
          />

          {/* Right Connection Beam */}
          <path
            d="M 390,110 L 220,110"
            stroke="url(#beamGrad)"
            strokeWidth={stage === "matching" || stage === "success" ? "2.5" : "1"}
            strokeDasharray={stage === "matching" ? "8, 6" : "none"}
            className={stage === "matching" ? "animate-[laser-flow_1.5s_linear_infinite]" : ""}
            filter={stage === "matching" || stage === "success" ? "url(#glow)" : ""}
          />
        </svg>

        {/* 4. Left Node: Buyer Profile */}
        <div
          className={`relative z-10 w-[155px] bg-[#0c0c16]/90 border rounded-2xl p-3.5 transition-all duration-300 shadow-xl ${
            stage === "buyer" || stage === "matching" || stage === "success"
              ? "border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)] scale-[1.02]"
              : "border-white/5 opacity-40 scale-[0.98]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${currentPair.buyer.avatarColor} flex items-center justify-center font-bold text-[11px] text-white`}>
              {currentPair.buyer.avatarLetter}
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-[10px] font-black text-white truncate leading-tight">
                {currentPair.buyer.name}
              </h4>
              <p className="text-[8px] font-semibold text-slate-400 truncate">
                {currentPair.buyer.role}
              </p>
            </div>
          </div>
          
          <div className="bg-pink-500/5 border border-pink-500/10 rounded-lg p-2 text-left">
            <span className="text-[7.5px] font-extrabold text-pink-400 uppercase tracking-wider block">
              Active Intent Need:
            </span>
            <p className="text-[9px] font-medium text-white/70 leading-normal mt-0.5">
              {currentPair.buyer.need}
            </p>
          </div>
        </div>

        {/* 5. Center Node: Glowing Match Core */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`h-14 w-14 rounded-full border flex items-center justify-center transition-all duration-300 ${
              stage === "matching" || stage === "success"
                ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-110"
                : "bg-white/5 border-white/10"
            }`}
          >
            <ArrowRightLeft className={`h-5 w-5 transition-transform duration-500 ${
              stage === "matching" ? "rotate-180 text-cyan-400 animate-spin" : "text-white/40"
            }`} />
          </div>
          <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mt-2 block">
            AI ENGINE
          </span>
        </div>

        {/* 6. Right Node: Seller Profile */}
        <div
          className={`relative z-10 w-[155px] bg-[#0c0c16]/90 border rounded-2xl p-3.5 transition-all duration-300 shadow-xl ${
            stage === "seller" || stage === "matching" || stage === "success"
              ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]"
              : "border-white/5 opacity-40 scale-[0.98]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${currentPair.seller.avatarColor} flex items-center justify-center font-bold text-[11px] text-white`}>
              {currentPair.seller.avatarLetter}
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-[10px] font-black text-white truncate leading-tight">
                {currentPair.seller.name}
              </h4>
              <p className="text-[8px] font-semibold text-slate-400 truncate">
                {currentPair.seller.role}
              </p>
            </div>
          </div>
          
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 text-left">
            <span className="text-[7.5px] font-extrabold text-emerald-400 uppercase tracking-wider block">
              Reciprocal Solution:
            </span>
            <p className="text-[9px] font-medium text-white/70 leading-normal mt-0.5">
              {currentPair.seller.offers}
            </p>
          </div>
        </div>

      </div>

      {/* 7. Success Banner/Card Overlay (Floats in when success is reached) */}
      <div className={`mt-4 w-full h-[72px] bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border rounded-2xl p-3 flex items-center justify-between transition-all duration-500 ${
        stage === "success"
          ? "border-emerald-500/30 translate-y-0 opacity-100 shadow-[0_10px_25px_rgba(16,185,129,0.1)]"
          : "border-transparent translate-y-3 opacity-0 pointer-events-none"
      }`}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <h5 className="text-[11px] font-extrabold text-white leading-tight">
              Reciprocal Match Found! ({currentPair.matchScore}%)
            </h5>
            <p className="text-[9px] font-semibold text-white/60 leading-normal mt-0.5">
              Intros generated. Warm meeting scheduled.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl">
          <Calendar className="h-3 w-3 text-cyan-400" />
          <span className="text-[9px] font-bold text-white">Oct 26, 2:00 PM</span>
        </div>
      </div>

      {/* Style settings for custom SVG dash offset flow */}
      <style>{`
        @keyframes laser-flow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

    </div>
  )
}
