import { Compass, Sparkles, Heart } from "lucide-react"

export function FutureVision() {
  return (
    <section id="vision" className="relative py-24 lg:py-32 bg-slate-50 dark:bg-zinc-950 transition-colors overflow-hidden">
      
      {/* Decorative Gradient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Main Content card */}
        <div className="bg-white dark:bg-[#0A0A0F] border border-slate-200 dark:border-white/5 rounded-[48px] p-8 sm:p-16 lg:p-20 shadow-2xl dark:shadow-none relative overflow-hidden text-center max-w-5xl mx-auto group">
          
          {/* Subtle grid lines background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Pulsing visual core */}
            <div className="h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform animate-pulse">
              <Compass className="h-8 w-8 text-blue-500" />
            </div>

            {/* Sub-label */}
            <span className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-[0.25em] block mb-6">
              Our Long-term Vision
            </span>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl leading-[1.1] mb-8 text-balance">
              The Future Of Business Opportunity Discovery
            </h2>

            {/* Sub-description copy */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-white/50 font-semibold leading-relaxed max-w-2xl mx-auto mb-10">
              We believe businesses should spend less time searching and more time building. Taplyzer is creating a future where relevant opportunities are discovered through intent, not chance.
            </p>

            {/* Interactive Stats and visual signatures */}
            <div className="flex items-center gap-6 border-t border-slate-100 dark:border-white/5 pt-10 w-full max-w-md justify-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">
                  Intent-Based Discovery
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">
                  Built for builders
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  )
}
export { FutureVision as Vision }
