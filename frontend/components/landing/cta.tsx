"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export function CTA() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const handlePrimaryCTA = () => {
    router.push(isLoggedIn ? "/dashboard" : "/auth?mode=signup")
  }

  const handleSecondaryCTA = () => {
    router.push(isLoggedIn ? "/dashboard" : "/auth?mode=signup")
  }

  return (
    <section 
      id="cta"
      className="relative pt-24 pb-44 lg:pt-32 lg:pb-48 bg-[#050508] overflow-hidden"
    >
      {/* Top separator line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
        
        {/* Glow Panel Container */}
        <div className="relative rounded-[32px] overflow-hidden border border-purple-500/20 bg-[#07070c]/55 shadow-[0_0_50px_rgba(139,92,246,0.1)] backdrop-blur-xl transition-all duration-300 hover:border-purple-500/30">
          
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Centered Panel Content */}
          <div className="relative z-10 text-center px-6 sm:px-12 py-16 sm:py-20 lg:py-24 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Stars rating element */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-black uppercase text-white/45 tracking-widest">
                Trusted by thousands of businesses worldwide
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4.5xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] text-balance mb-6 uppercase font-sans">
              Ready To Discover Better
              <br />
              Business Opportunities?
            </h2>

            {/* Subheading */}
            <p className="text-[14px] sm:text-[16px] text-white/50 leading-relaxed font-semibold max-w-xl mb-10">
              Join businesses exploring a smarter way to connect, collaborate, and grow. Stop cold emailing and start closing qualified matches today.
            </p>

            {/* CTA Buttons */}
            <div id="cta-buttons" className="flex flex-col sm:flex-row gap-4.5 justify-center items-center w-full sm:w-auto">
              <Button
                onClick={handlePrimaryCTA}
                size="lg"
                className="w-full sm:w-auto h-13 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full text-xs uppercase tracking-wider gap-1.5 shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] hover:scale-[1.01] transition-all duration-200 cursor-pointer border-0"
              >
                <span>Join Early Access</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleSecondaryCTA}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-13 px-8 border-white/10 hover:bg-white/5 text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all hover:scale-[1.01] cursor-pointer bg-white/[0.02] border"
              >
                Explore Taplyzer
              </Button>
            </div>

            {/* Secure Signal Footnote */}
            <p className="text-[10px] text-white/35 font-black uppercase tracking-widest mt-8">
              No long commitment required · Private & Vetted Commercial Network
            </p>

          </div>
        </div>

      </div>
    </section>
  )
}
export { CTA as default }
