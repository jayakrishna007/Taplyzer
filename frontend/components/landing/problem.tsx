import { PhoneOff, MessageSquareOff, Users, ArrowDown, Search, XCircle } from "lucide-react"

const stats = [
  {
    icon: PhoneOff,
    topVal: "200+ Cold Calls",
    bottomVal: "1 Interested Prospect",
    description: "Endless rejection, voicemails, and wasted sales hours chasing cold prospects.",
    color: "from-red-500/10 to-orange-500/5",
    border: "border-red-500/25",
    iconColor: "text-red-500"
  },
  {
    icon: MessageSquareOff,
    topVal: "50+ LinkedIn Messages",
    bottomVal: "Few Meaningful Replies",
    description: "Inboxes overflowing with generic pitches that are quickly deleted or ignored.",
    color: "from-amber-500/10 to-yellow-500/5",
    border: "border-amber-500/25",
    iconColor: "text-amber-500"
  },
  {
    icon: Users,
    topVal: "Hours of Networking",
    bottomVal: "Uncertain Results",
    description: "Tireless small talk at business events with no strategic intent or alignment.",
    color: "from-purple-500/10 to-indigo-500/5",
    border: "border-purple-500/25",
    iconColor: "text-purple-500"
  }
]

export function Problem() {
  return (
    <section className="relative py-24 lg:py-32 bg-white dark:bg-black transition-colors overflow-hidden">
      
      {/* Decorative Gradient Background Divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black mb-6 uppercase tracking-widest">
            <XCircle className="h-4 w-4 shrink-0" />
            The Friction
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance leading-tight">
            Businesses Don&apos;t Have an Opportunity Problem.
            <br />
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              They Have a Discovery Problem.
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-500 dark:text-white/50 font-semibold max-w-2xl mx-auto leading-relaxed">
            Finding the right business at the right time remains inefficient, manual, and unpredictable.
          </p>
        </div>

        {/* Content & Stats Cards Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Core Description List */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Every day businesses spend hours:
            </h3>
            
            <div className="space-y-4">
              {[
                { title: "Cold calling", text: "Dialing generic lead lists with near-zero conversion rates." },
                { title: "Sending outreach messages", text: "Spamming LinkedIn and email hoping for a reply." },
                { title: "Attending networking events", text: "Collecting business cards from random participants." },
                { title: "Searching for clients", text: "Scouring job boards or directory lists manually." },
                { title: "Looking for partners", text: "Vetting vendors without verified intent alignment." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all">
                  <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white leading-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-white/45 mt-1 font-medium leading-normal">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-slate-600 dark:text-white/60 font-black border-l-4 border-red-500 pl-4 py-2 italic text-sm leading-relaxed">
              Yet most conversations never become opportunities. Traditional networking wastes time with contacts who simply aren&apos;t buying.
            </p>
          </div>

          {/* Right Column: Stats Comparison Cards */}
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-6 lg:gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`relative bg-gradient-to-b ${stat.color} border ${stat.border} rounded-[28px] p-6 lg:p-8 flex flex-col justify-between items-center text-center shadow-lg dark:shadow-none hover:-translate-y-1 transition-all group`}
              >
                {/* Stat Icon */}
                <div className={`h-12 w-12 rounded-xl bg-white dark:bg-[#0c0c14] shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>

                {/* Path Flow */}
                <div className="flex flex-col items-center gap-2 mb-6">
                  <span className="text-lg lg:text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                    {stat.topVal}
                  </span>
                  
                  <div className="h-8 flex flex-col items-center justify-center">
                    <ArrowDown className={`h-5 w-5 ${stat.iconColor} animate-bounce`} />
                  </div>

                  <span className="text-base lg:text-lg font-black text-slate-700 dark:text-white/60 tracking-tight leading-tight">
                    {stat.bottomVal}
                  </span>
                </div>

                {/* Subtext description */}
                <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed font-bold uppercase tracking-wide">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </section>
  )
}
