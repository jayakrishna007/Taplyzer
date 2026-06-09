"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"

export function IntentAnimation() {
  const [step, setStep] = useState(1)

  useEffect(() => {
    // Loop steps smoothly:
    // 1: Business A lists intent need ("Needs Client")
    // 2: Business B lists intent offering ("Offers Services")
    // 3: Central Taplyzer Engine processes & glows
    // 4: Meeting scheduled glass card floats in
    // 5: Entire B2B matching network fully active and glowing
    const interval = setInterval(() => {
      setStep((prev) => (prev % 5) + 1)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="relative w-full max-w-[720px] mx-auto aspect-[16/10.5] bg-transparent overflow-visible select-none"
    >
      {/* High-fidelity Neon glow filters, laser dashes, and hover micro-animations */}
      <style>{`
        @keyframes pulse-concentric-2d {
          0%, 100% { transform: scale(1); opacity: 0.7; filter: drop-shadow(0 0 10px rgba(45,212,191,0.6)); }
          50% { transform: scale(1.03); opacity: 1; filter: drop-shadow(0 0 25px rgba(45,212,191,0.95)); }
        }
        @keyframes laser-dash-flow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes card-float-2d {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes beam-glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* 1. HIGH-FIDELITY 2D ISOMETRIC SVG ILLUSTRATION CANVAS */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 640 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyan Glow filter */}
          <filter id="neonCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Blue/Cyan Laser Gradient */}
          <linearGradient id="blueLaser" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1" />
          </linearGradient>

          {/* Green Laser Gradient */}
          <linearGradient id="greenLaser" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>

          {/* Isometric Grid Pattern */}
          <pattern id="isoGrid" width="60" height="34.64" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 60 17.32 L 30 34.64 L 0 17.32 Z" stroke="rgba(255,255,255,0.015)" strokeWidth="1" fill="none" />
            <path d="M 0 17.32 L 30 17.32" stroke="rgba(255,255,255,0.01)" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>

        {/* 2D Isometric Grid Floor */}
        <rect width="640" height="420" fill="url(#isoGrid)" opacity="0.8" />

        {/* 2. ISOMETRIC CIRCUIT CHANNELS - DRAWN WITH HIGH-FIDELITY BENDS */}
        {/* Left pipeline: Business A (135, 160) -> Center (320, 240) */}
        <path
          d="M 135,160 L 220,210 L 220,240 L 320,240"
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {step >= 1 && (
          <path
            d="M 135,160 L 220,210 L 220,240 L 320,240"
            stroke="url(#blueLaser)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="18 45"
            strokeDashoffset="0"
            className="animate-[laser-dash-flow_3s_linear_infinite]"
            filter="url(#neonCyanGlow)"
          />
        )}

        {/* Right pipeline: Business B (505, 160) -> Center (320, 240) */}
        <path
          d="M 505,160 L 420,210 L 420,240 L 320,240"
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {step >= 2 && (
          <path
            d="M 505,160 L 420,210 L 420,240 L 320,240"
            stroke="url(#greenLaser)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="18 45"
            strokeDashoffset="0"
            className="animate-[laser-dash-flow_3s_linear_infinite]"
            filter="url(#neonCyanGlow)"
          />
        )}

        {/* User Pedestal connector path */}
        <path
          d="M 210,320 L 210,240 L 220,240"
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {step >= 1 && (
          <path
            d="M 210,320 L 210,240 L 220,240"
            stroke="url(#blueLaser)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 30"
            strokeDashoffset="0"
            className="animate-[laser-dash-flow_2.5s_linear_infinite]"
            filter="url(#neonCyanGlow)"
          />
        )}

        {/* --- 2D ISOMETRIC VOLUMETRIC SLAB: Taplyzer Intent Engine Platform --- */}
        {/* Bottom base plate thickness shadow */}
        <path
          d="M 320,205 L 420,250 L 320,295 L 220,250 Z"
          fill="rgba(6, 182, 212, 0.04)"
          stroke="rgba(6, 182, 212, 0.1)"
          strokeWidth="2"
        />
        {/* Solid 3D bevel height connectors */}
        <path
          d="M 220,240 L 220,250 L 320,295 L 320,285 Z"
          fill="#0c0c16"
          stroke="rgba(6, 182, 212, 0.15)"
          strokeWidth="1.5"
        />
        <path
          d="M 420,240 L 420,250 L 320,295 L 320,285 Z"
          fill="#08080f"
          stroke="rgba(6, 182, 212, 0.15)"
          strokeWidth="1.5"
        />
        {/* Top platform face (diamond shape offset upwards) */}
        <path
          d="M 320,195 L 420,240 L 320,285 L 220,240 Z"
          fill="#0b0b14"
          stroke="rgba(34, 211, 238, 0.25)"
          strokeWidth="2"
        />

        {/* Concentric holographic targets drawn inside the top diamond face */}
        <g className={step >= 3 ? "animate-[pulse-concentric-2d_3s_infinite] origin-center" : "opacity-35"}>
          {/* Outer glowing target ellipse */}
          <ellipse cx="320" cy="240" rx="60" ry="28" stroke="#2dd4bf" strokeWidth="2.5" fill="none" filter="url(#neonCyanGlow)" />
          {/* Middle dashed target ellipse */}
          <ellipse cx="320" cy="240" rx="44" ry="20" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 4" fill="none" />
          {/* Inner green target ellipse */}
          <ellipse cx="320" cy="240" rx="28" ry="13" stroke="#10b981" strokeWidth="2.5" fill="rgba(16,185,129,0.08)" />
          {/* Glowing central core ellipse */}
          <ellipse cx="320" cy="240" rx="14" ry="6.5" fill="#2dd4bf" filter="url(#neonCyanGlow)" />
        </g>

        {/* Thin vertical 2D Hologram line pointing down to the concentric core */}
        <line
          x1="320" y1="120"
          x2="320" y2="230"
          stroke="url(#blueLaser)"
          strokeWidth="2"
          className="animate-[beam-glow-pulse_3.5s_infinite]"
        />

        {/* 2D Isometric circular User Pedestal base */}
        <ellipse cx="210" cy="320" rx="22" ry="10" fill="#050508" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" />
        <ellipse cx="210" cy="316" rx="20" ry="9" fill="#0b0b14" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1.5" />
      </svg>

      {/* Labeled subtexts styled exactly like reference image (using pure 2D layout) */}
      <div className="absolute left-[13%] top-[53%] -rotate-[10deg] pointer-events-none select-none text-[8.5px] font-black text-white/30 uppercase tracking-widest">
        Needs Client
      </div>

      <div className="absolute right-[22%] top-[52%] rotate-[10deg] pointer-events-none select-none text-[8.5px] font-black text-white/30 uppercase tracking-widest">
        Offers Services
      </div>

      {/* --- NODE A: Business A (Agency) Card --- */}
      {/* Positioned absolute using precise percentages to scale with the SVG container */}
      <div 
        onClick={() => setStep(1)}
        className={`absolute left-[11%] top-[24%] w-[150px] bg-[#0c0c16]/85 border rounded-2xl p-3.5 transition-all duration-500 cursor-pointer select-none backdrop-blur-md shadow-[0_20px_45px_rgba(0,0,0,0.8)] hover:scale-[1.02] flex items-center gap-2.5 ${
          step >= 1 
            ? "border-blue-500/50 ring-2 ring-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)]" 
            : "border-white/5 hover:border-blue-500/30"
        }`}
      >
        {/* Blue glowing "A" icon */}
        <div className="h-8.5 w-8.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <span className="text-xs font-black text-blue-400">A</span>
        </div>
        <div className="min-w-0 text-left">
          <h4 className="text-[10px] sm:text-[11px] font-black text-white leading-none">Business A</h4>
          <p className="text-[8px] font-semibold text-slate-400 mt-1 leading-none">(Agency)</p>
        </div>
      </div>

      {/* --- NODE B: Business B (SaaS) Card --- */}
      <div 
        onClick={() => setStep(2)}
        className={`absolute right-[11%] top-[24%] w-[150px] bg-[#0c0c16]/85 border rounded-2xl p-3.5 transition-all duration-500 cursor-pointer select-none backdrop-blur-md shadow-[0_20px_45px_rgba(0,0,0,0.8)] hover:scale-[1.02] flex items-center gap-2.5 ${
          step >= 2 
            ? "border-emerald-500/50 ring-2 ring-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]" 
            : "border-white/5 hover:border-emerald-500/30"
        }`}
      >
        {/* Green glowing layers stack icon */}
        <div className="h-8.5 w-8.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <svg className="h-4.5 w-4.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="min-w-0 text-left">
          <h4 className="text-[10px] sm:text-[11px] font-black text-white leading-none">Business B</h4>
          <p className="text-[8px] font-semibold text-slate-400 mt-1 leading-none">(SaaS)</p>
        </div>
      </div>

      {/* --- PEDESTAL USER SILHOUETTE NODE --- */}
      <div 
        className="absolute left-[29.5%] top-[68%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0c0c16]/95 border border-cyan-500/30 flex items-center justify-center pointer-events-none select-none shadow-md"
      >
        <span className="text-[10px] text-cyan-400">👤</span>
      </div>

      {/* --- ENGINE POINTING HOLOGRAM TAG --- */}
      {/* Floating directly above the central platform with a vertical leader pointer */}
      <div 
        className="absolute left-[50%] top-[14%] -translate-x-1/2 bg-[#0c0c16]/95 border border-cyan-500/25 rounded-2xl p-2 px-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center gap-2 select-none z-20"
      >
        {/* Miniature network node branding icon */}
        <div className="h-5 w-5 rounded-lg bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(45,212,191,0.2)]">
          <svg className="h-3 w-3 text-[#2dd4bf]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="14" fill="currentColor" />
            <line x1="50" y1="50" x2="25" y2="30" stroke="currentColor" strokeWidth="10" />
            <line x1="50" y1="50" x2="75" y2="30" stroke="currentColor" strokeWidth="10" />
            <line x1="50" y1="50" x2="50" y2="80" stroke="currentColor" strokeWidth="10" />
          </svg>
        </div>
        <div className="text-left leading-none">
          <span className="text-[10px] font-bold text-white block">Taplyzer</span>
          <span className="text-[7.5px] font-semibold text-cyan-400 tracking-wider uppercase block mt-0.5">Intent Engine</span>
        </div>
      </div>

      {/* --- FOREGROUND GLASS CARD: Meeting Scheduled --- */}
      {step >= 4 && (
        <div 
          className="absolute right-[6%] bottom-[12%] w-[220px] bg-[#0c0c16]/95 border border-cyan-500/20 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-md z-25 text-left animate-[card-float-2d_4.5s_ease-in-out_infinite]"
        >
          <h5 className="text-[12px] font-extrabold text-white leading-tight mb-3">Meeting Scheduled:<br/>Project Discovery</h5>
          
          <div className="flex items-center gap-2 border-t border-white/5 pt-2.5 mb-1.5 text-[9px] font-bold text-white/50">
            <span className="text-white/30">Date:</span>
            <span className="text-white">Oct 26</span>
          </div>

          <div className="flex items-center gap-2 mb-3 text-[9px] font-bold text-white/50">
            <span className="text-white/30">Time:</span>
            <span className="text-white">2:00 PM</span>
          </div>

          {/* Stylised user avatar list exactly matching reference layout with realistic face vectors */}
          <div className="flex items-center -space-x-1.5 mt-3 border-t border-white/5 pt-3">
            {/* Male Avatar SVG Vector */}
            <div className="h-6.5 w-6.5 rounded-full border border-black overflow-hidden bg-slate-800 shadow-md">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill="#3b82f6" />
                <path d="M 20,40 Q 50,15 80,40 Q 85,20 60,15 Q 40,15 20,40" fill="#1e293b" />
                <circle cx="50" cy="50" r="28" fill="#fbcfe8" />
                <path d="M 30,55 Q 50,85 70,55 L 70,70 Q 50,90 30,70 Z" fill="#1e293b" />
                <circle cx="42" cy="48" r="3" fill="#0f172a" />
                <circle cx="58" cy="48" r="3" fill="#0f172a" />
              </svg>
            </div>
            {/* Female Avatar SVG Vector */}
            <div className="h-6.5 w-6.5 rounded-full border border-black overflow-hidden bg-slate-800 shadow-md">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill="#10b981" />
                <path d="M 15,45 Q 50,20 85,45 L 80,85 Q 50,95 20,85 Z" fill="#78350f" />
                <circle cx="50" cy="48" r="26" fill="#fed7aa" />
                <path d="M 24,35 Q 50,15 76,35 Q 65,25 50,28 Q 35,25 24,35" fill="#451a03" />
                <circle cx="43" cy="46" r="2.5" fill="#0f172a" />
                <circle cx="57" cy="46" r="2.5" fill="#0f172a" />
              </svg>
            </div>
            {/* Plus button */}
            <div className="h-6.5 w-6.5 rounded-full bg-slate-850 border border-white/10 flex items-center justify-center text-[9px] font-extrabold text-white/70 select-none shadow-md">
              +
            </div>
          </div>
        </div>
      )}

      {/* --- SIMULATION DOT SELECTORS --- */}
      <div className="flex justify-center items-center gap-2 z-30 mt-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setStep(s)} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? "w-6 bg-cyan-400" : "w-1.5 bg-white/10 hover:bg-white/20"}`} />
        ))}
      </div>
    </div>
  )
}
