"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { ParticleCanvas } from "./particle-canvas"
import { ThreeDimensionalParticles } from "./three-dimensional-particles"

export function Hero() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const [textIndex, setTextIndex] = useState(0)
  const [fade, setFade] = useState(true)

  const phrases = [
    "Intent-Driven Networking.",
    "Automated Warm Intros.",
    "Reciprocal AI Matching.",
    "High-Value Meetings."
  ]

  useEffect(() => {
    const textInterval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % phrases.length)
        setFade(true)
      }, 300) // matches fade-out duration
    }, 3800)

    return () => clearInterval(textInterval)
  }, [])

  const handleCTA = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth?mode=signup")
    }
  }

  const handleWatchTour = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth?mode=signin")
    }
  }

  return (
    <section 
      id="home"
      className="relative w-full min-h-screen bg-[#050508] flex flex-col items-center justify-center overflow-hidden py-24 sm:py-32"
    >
      {/* 1. BRIGHT INTERACTIVE BACKGROUND CANVAS */}
      <ParticleCanvas />

      {/* Legibility Filter Overlay (lightened to keep background dots highly visible) */}
      <div className="absolute inset-0 bg-[#050508]/40 backdrop-blur-[0.3px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/15 to-[#050508] pointer-events-none z-0" />

      {/* 2. AMBIENT BACKGROUND GLOWS */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden opacity-55">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] sm:w-[950px] sm:h-[950px] rounded-full bg-gradient-to-br from-cyan-500/10 via-[#10b981]/5 to-indigo-600/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[110px]" />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 flex flex-col items-center flex-grow justify-center">

        {/* 3. TWO COLUMN MAIN CONTENT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column: Headline and actions */}
          <div className="lg:col-span-7 flex flex-col text-left items-start">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-400 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Next-Gen Matchmaking</span>
            </div>

            {/* Centered Headline with animated changing phrase */}
            <h1 className="text-[36px] sm:text-[50px] lg:text-[56px] font-black tracking-tight leading-[1.05] text-white max-w-2xl font-sans uppercase">
              Revolutionize B2B Matching with
              <br />
              <span className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 transition-all duration-300 ${
                fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}>
                {phrases[textIndex]}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-[14px] sm:text-[16px] lg:text-[17px] text-white/60 font-semibold max-w-xl leading-relaxed">
              Taplyzer connects agencies and SaaS providers using precision intent data,
              automating warm introductions and scheduling high-value meetings effortlessly.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {isLoading ? (
                <div className="h-12 w-48 bg-white/5 rounded-full animate-pulse" />
              ) : (
                <>
                  <Button
                    onClick={handleCTA}
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#0d9668] hover:to-[#047857] text-white font-bold rounded-full shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.01] transition-all duration-200 text-xs uppercase tracking-wider w-full sm:w-auto cursor-pointer border-0"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Get Early Access"}
                  </Button>
                  <Button
                    onClick={handleWatchTour}
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 border-white/10 bg-white/[0.02] hover:bg-white/5 text-white font-bold rounded-full text-xs uppercase tracking-wider backdrop-blur-sm transition-all hover:scale-[1.01] w-full sm:w-auto border"
                  >
                    {isLoggedIn ? "View Platform" : "Watch Platform Tour"}
                  </Button>
                </>
              )}
            </div>

          </div>

          {/* Right Column: 3D Matching Network Node Model */}
          <div className="lg:col-span-5 flex justify-center w-full relative">
            {/* Soft decorative background radial light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-cyan-500/10 rounded-full blur-[70px] pointer-events-none z-0" />
            <div className="w-full max-w-[460px] aspect-square relative z-10 flex items-center justify-center">
              <ThreeDimensionalParticles />
            </div>
          </div>

        </div>

        {/* 4. TRUSTED BY INDUSTRY LEADERS SECTION */}
        <div className="mt-20 w-full max-w-5xl border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-[11px] font-black uppercase text-white/35 tracking-widest font-sans">
            Trusted by Industry Leaders
          </span>
          
          <div className="flex items-center gap-8 sm:gap-11 flex-wrap justify-center text-[#8e8f96]/70">
            {/* Microsoft Logo */}
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:text-white/60 transition-colors cursor-default select-none">
              <svg className="h-3.5 w-3.5 text-white/40" viewBox="0 0 23 23" fill="currentColor">
                <rect x="0" y="0" width="10.5" height="10.5"/>
                <rect x="12" y="0" width="10.5" height="10.5"/>
                <rect x="0" y="12" width="10.5" height="10.5"/>
                <rect x="12" y="12" width="10.5" height="10.5"/>
              </svg>
              <span>Microsoft</span>
            </div>

            {/* Arowck Logo */}
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-widest hover:text-white/60 transition-colors cursor-default select-none">
              <svg className="h-4.5 w-4.5 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
              </svg>
              <span>Arowck</span>
            </div>

            {/* emremin Logo */}
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:text-white/60 transition-colors cursor-default select-none">
              <svg className="h-3.5 w-3.5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
              <span>emremin</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  )
}
export { Hero as default }
