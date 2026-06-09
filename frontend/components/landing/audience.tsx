import { Megaphone, ShoppingBag, Laptop, Award, Rocket, CheckCircle2 } from "lucide-react"

const audiences = [
  {
    icon: Megaphone,
    title: "Digital Marketing Agencies",
    description: "Find brand partners and enterprise clients actively seeking performance growth, social campaigns, SEO development, and paid media execution.",
    tag: "Scale Client Roster",
    color: "from-blue-500/10 to-indigo-500/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-500"
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands",
    description: "Discover trusted marketing agencies, logistics and fulfillment partners, inventory capital providers, and strategic software suppliers.",
    tag: "Optimize Operations",
    color: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-500"
  },
  {
    icon: Laptop,
    title: "SaaS Companies",
    description: "Connect with high-intent business buyers, distribution channels, and enterprise integration partners actively looking for specialized software tools.",
    tag: "Accelerate Distribution",
    color: "from-purple-500/10 to-violet-500/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-500"
  },
  {
    icon: Award,
    title: "Consultants",
    description: "Meet growing businesses needing immediate fractional leadership, software architecture design, executive advisory, and operational consulting.",
    tag: "Monetize Expertise",
    color: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-500"
  },
  {
    icon: Rocket,
    title: "Startups",
    description: "Find early strategic vendor agreements, joint venture partners, B2B beta testers, and business development growth pathways.",
    tag: "Ignite Growth",
    color: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
    iconColor: "text-pink-500"
  }
]

export function Audience() {
  return (
    <section id="audience" className="relative py-24 lg:py-32 bg-slate-50 dark:bg-zinc-950 transition-colors overflow-hidden">
      
      {/* Glow divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black mb-6 uppercase tracking-widest">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Target Profiles
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance leading-tight">
            Built For Growth-Focused Businesses
          </h2>
          <p className="mt-6 text-lg text-slate-500 dark:text-white/50 font-semibold max-w-2xl mx-auto leading-relaxed">
            Taplyzer is built to streamline discovery for key stakeholders looking to connect and close transactions based on verified intent.
          </p>
        </div>

        {/* 5-Card Balanced Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {audiences.slice(0, 3).map((aud, idx) => (
            <div
              key={idx}
              className={`bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-white/5 rounded-[32px] p-8 sm:p-10 shadow-lg dark:shadow-none hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col justify-between group`}
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start mb-8">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${aud.color} flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:scale-105 transition-transform`}>
                    <aud.icon className={`h-6.5 w-6.5 ${aud.iconColor}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 dark:text-white/30`}>
                    {aud.tag}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 group-hover:text-blue-500 transition-colors">
                  {aud.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-semibold">
                  {aud.description}
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 dark:border-white/5 pt-6">
                <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">
                  Popular Intents:
                </span>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {idx === 0 ? "Performance Media, SEO" : idx === 1 ? "SaaS Software, 3PL Logistics" : "Integration partners, Enterprise Deals"}
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Row - 2 Columns Center Balanced on Desktop */}
          {audiences.slice(3).map((aud, idx) => (
            <div
              key={idx + 3}
              className={`bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-white/5 rounded-[32px] p-8 sm:p-10 shadow-lg dark:shadow-none hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col justify-between group lg:col-span-1`}
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${aud.color} flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:scale-105 transition-transform`}>
                    <aud.icon className={`h-6.5 w-6.5 ${aud.iconColor}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 dark:text-white/30`}>
                    {aud.tag}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 group-hover:text-blue-500 transition-colors">
                  {aud.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-semibold">
                  {aud.description}
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 dark:border-white/5 pt-6">
                <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block">
                  Popular Intents:
                </span>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {idx === 0 ? "Fractional leadership, Vetting advisory" : "Beta launch users, Strategic vendors"}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  )
}
