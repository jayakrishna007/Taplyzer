"use client"

import { MouseEvent, useRef } from "react"

const steps = [
  {
    num: "1",
    title: "Define Profile & Intent",
    description: "Create your business profile, specify what services or solutions you offer, and outline the target partnerships or clients you need.",
  },
  {
    num: "2",
    title: "AI Reciprocal Matching",
    description: "Our matchmaking engine automatically cross-references active B2B intent parameters, surface-matching highly aligned synergy leads.",
  },
  {
    num: "3",
    title: "Connect & Book Meetings",
    description: "Skip cold calling completely. Instantly send automated warm introduction requests and schedule video consultations directly.",
  }
]

function StepCard({ num, title, description }: { num: string; title: string; description: string }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty("--mouse-x", `${x}px`)
    card.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative bg-[#07070c]/55 border border-white/[0.04] rounded-3xl p-8 sm:p-10 overflow-hidden hover:border-cyan-500/20 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-start min-h-[250px]"
    >
      {/* Spotlight Hover Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: "radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(34, 211, 238, 0.06) 0%, transparent 60%)"
        }}
      />

      <div className="relative z-10 flex flex-col">
        {/* Large Number Digit */}
        <span className="text-[52px] font-black text-white/5 group-hover:text-cyan-400/10 transition-colors duration-300 mb-6 leading-none">
          {num}
        </span>

        {/* Step Title */}
        <h3 className="text-xl font-bold text-white tracking-tight mb-3 group-hover:text-cyan-300 transition-colors duration-300">
          {title}
        </h3>

        {/* Step Description */}
        <p className="text-[13px] sm:text-[14px] text-white/50 leading-relaxed font-semibold">
          {description}
        </p>
      </div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section 
      id="how-it-works" 
      className="relative py-24 lg:py-32 bg-[#050508] overflow-hidden"
    >
      {/* Glow top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Decorative background light orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] sm:text-[11px] font-black mb-6 uppercase tracking-widest">
            <span>The Process</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl text-balance leading-tight uppercase font-sans">
            How Taplyzer Works
          </h2>
          <p className="mt-6 text-[15px] sm:text-[17px] text-white/50 font-medium max-w-2xl mx-auto leading-relaxed">
            Just three simple steps to transform your active business intent into scheduled, high-value commercial match opportunities.
          </p>
        </div>

        {/* 3-Column steps grid */}
        <div className="grid md:grid-cols-3 gap-6.5">
          {steps.map((step, idx) => (
            <StepCard
              key={idx}
              num={step.num}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>

      </div>

    </section>
  )
}
export { HowItWorks as default }
