"use client"

import { 
  Briefcase, MapPin, Globe, Zap, ArrowRight, 
  Sparkles, Heart, Rocket, Users, ShieldCheck,
  CheckCircle2, Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const JOBS = [
  { title: "Senior AI Engineer", team: "Engineering", type: "Full-time", loc: "Remote / SF", id: 1 },
  { title: "Growth Marketing Lead", team: "Marketing", type: "Full-time", loc: "New York / Remote", id: 2 },
  { title: "Product Designer (UI/UX)", team: "Product", type: "Full-time", loc: "London / Remote", id: 3 },
  { title: "Strategic Partnerships Manager", team: "Operations", type: "Full-time", loc: "Remote", id: 4 }
]

export default function CareersPage() {
  return (
    <div className="py-24 space-y-32">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
           <Rocket className="h-3.5 w-3.5" /> We're Hiring
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          Build the <span className="text-primary">Future.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
          Join a team of visionaries rebuilding the infrastructure of global business networking.
        </p>
      </div>

      {/* Values Grid */}
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
         {[
           { title: "Mission Driven", desc: "We are obsessed with solving the trust problem in business.", icon: Target },
           { title: "Fully Remote", desc: "We hire the best talent from every corner of the globe.", icon: Globe },
           { title: "Equity First", desc: "Every employee is an owner of the Taplyzer ecosystem.", icon: Heart }
         ].map(val => (
           <div key={val.title} className="p-10 rounded-[3rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto text-primary">
                 <val.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">{val.title}</h3>
              <p className="text-slate-500 font-medium italic">{val.desc}</p>
           </div>
         ))}
      </div>

      {/* Jobs List */}
      <div className="max-w-5xl mx-auto px-4 space-y-12">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Open Roles</h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <Users className="h-4 w-4" /> 24 total openings
            </div>
         </div>
         <div className="grid gap-4">
            {JOBS.map(job => (
              <div key={job.id} className="group p-8 rounded-[2rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer shadow-sm">
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> {job.team}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {job.loc}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md">{job.type}</span>
                    </div>
                 </div>
                 <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-white/5 font-black uppercase tracking-widest text-[10px] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
            ))}
         </div>
      </div>

      {/* Perks */}
      <div className="max-w-7xl mx-auto px-4 bg-slate-900 dark:bg-primary rounded-[4rem] p-12 md:p-24 overflow-hidden relative shadow-2xl shadow-primary/30">
         <div className="absolute top-0 right-0 p-24 opacity-10 rotate-12 scale-150">
            <Sparkles className="h-96 w-96 text-white" />
         </div>
         <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-tight">Perks of the network.</h2>
               <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    "Learning Budget", "Health & Wellness", "Annual Retreats", "Modern Equipment", "flexible hours", "Mentorship"
                  ].map(p => (
                    <div key={p} className="flex items-center gap-3 text-white/80 font-black uppercase tracking-widest text-[10px]">
                       <CheckCircle2 className="h-4 w-4 text-white" /> {p}
                    </div>
                  ))}
               </div>
            </div>
            <div className="p-10 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 text-center space-y-6">
               <h3 className="text-2xl font-black italic tracking-tight text-white">Don't see a fit?</h3>
               <p className="text-white/60 font-medium italic">We're always looking for exceptional people. Send us your resume anyway.</p>
               <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-[11px] shadow-xl">
                  General Application
               </Button>
            </div>
         </div>
      </div>
    </div>
  )
}

