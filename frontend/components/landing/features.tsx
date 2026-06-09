"use client"

import { MouseEvent, useRef } from "react"

const reasons = [
  {
    num: "01",
    title: "Intent First",
    description: "Matches are based directly on active, real-time business needs, eliminating generic solicitations and cold spam.",
  },
  {
    num: "02",
    title: "Less Guesswork",
    description: "Spend 90% less time prospecting, chasing dead-ends, or attending endless generic networking breakfast events.",
  },
  {
    num: "03",
    title: "Business Focused",
    description: "Built strictly to facilitate commercial agreements, introductions, and deals—not social media vanity metrics or feed algorithms.",
  },
  {
    num: "04",
    title: "Verified Businesses",
    description: "Robust profile checking processes (LinkedIn, email, phone, website reviews) help build absolute confidence and safety.",
  },
  {
    num: "05",
    title: "Opportunity Driven",
    description: "Designed specifically to lead you straight to private discovery discussions and scheduled video consultations.",
  },
  {
    num: "06",
    title: "AI Assisted Matching",
    description: "Intelligent matching algorithm ranks business proposals dynamically using reciprocal offerings and requirements.",
  }
]

function FeatureCard({ num, title, description }: { num: string; title: string; description: string }) {
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
      className="group relative bg-[#07070c]/55 border border-white/[0.04] rounded-3xl p-8 sm:p-10 overflow-hidden hover:border-cyan-500/25 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between"
    >
      {/* Radial Hover Spotlight Border Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: "radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(45, 212, 191, 0.08) 0%, transparent 60%)"
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Large Index Number */}
        <span className="text-[32px] font-black tracking-tight text-white/10 group-hover:text-cyan-400/20 transition-colors duration-300 mb-6">
          {num}
        </span>

        {/* Feature Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-3 group-hover:text-cyan-300 transition-colors duration-300">
          {title}
        </h3>

        {/* Feature Description */}
        <p className="text-[13px] sm:text-[14px] text-white/50 leading-relaxed font-semibold">
          {description}
        </p>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section 
      id="features" 
      className="relative py-24 lg:py-32 bg-[#050508] overflow-hidden"
    >
      {/* Glow top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Decorative background light orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] sm:text-[11px] font-black mb-6 uppercase tracking-widest">
            <span>The Advantages</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl text-balance leading-tight uppercase font-sans">
            Why Businesses Choose Taplyzer
          </h2>
          <p className="mt-6 text-[15px] sm:text-[17px] text-white/50 font-medium max-w-2xl mx-auto leading-relaxed">
            Eliminating commercial noise. Taplyzer represents the transition from broad, wasteful B2B networking to razor-focused, intent-based matchmaking.
          </p>
        </div>

        {/* 6-Grid Value Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6.5">
          {reasons.map((reason, idx) => (
            <FeatureCard
              key={idx}
              num={reason.num}
              title={reason.title}
              description={reason.description}
            />
          ))}
        </div>

      </div>

    </section>
  )
}

export { Features as WhyTaplyzer }
