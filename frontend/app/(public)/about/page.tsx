"use client"

import { 
  Users, Target, Globe, ShieldCheck, Zap, 
  Award, Rocket, Heart, Sparkles, Building2,
  ArrowRight, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const TEAM = [
  { name: "Saurav Kumar", role: "Founder & CEO", company: "Taplyzer", bio: "Serial entrepreneur focused on building high-trust networking ecosystems." },
  { name: "Anjali Sharma", role: "CTO", company: "Taplyzer", bio: "AI specialist with a passion for neural matching and secure deal flow." },
  { name: "Vikram Singh", role: "Head of Growth", company: "Taplyzer", bio: "Ex-VC with deep insights into strategic business development." }
]

export default function AboutPage() {
  return (
    <div className="py-24 space-y-32">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          Our <span className="text-primary">Mission.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
          We are rebuilding the global business networking layer to prioritize intent over activity, and trust over volume.
        </p>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
         <div className="space-y-8">
            <div className="h-1 bg-primary w-24 rounded-full" />
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-tight">Born from the friction of cold outreach.</h2>
            <p className="text-lg font-medium text-slate-500 leading-relaxed italic">
              Taplyzer was founded in 2024 to solve a simple problem: the signal-to-noise ratio in B2B networking was broken. 
              <br /><br />
              In a world of spam and superficial connections, we built a platform where every introduction is backed by verified intent and strategic alignment.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
               <div className="space-y-2">
                  <span className="text-4xl font-black text-primary italic">10k+</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Businesses</p>
               </div>
               <div className="space-y-2">
                  <span className="text-4xl font-black text-primary italic">$500M+</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deal Value Tracked</p>
               </div>
            </div>
         </div>
         <div className="relative">
            <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-[4rem] border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
               <Sparkles className="h-32 w-32 text-primary opacity-20 animate-pulse" />
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-white dark:bg-[#0A0A0A] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 max-w-xs">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Trust Guaranteed</span>
               </div>
               <p className="text-xs font-medium text-slate-500 leading-relaxed italic">Every company on Taplyzer goes through a multi-factor verification process.</p>
            </div>
         </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4 space-y-16">
         <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">The Visionaries</h2>
            <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px] font-black">Building the future of strategic networking</p>
         </div>
         <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map(member => (
              <div key={member.name} className="p-8 rounded-[3rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all duration-500 text-center space-y-6">
                 <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-white/5 mx-auto border-2 border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-3xl text-primary">
                    {member.name[0]}
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">{member.name}</h3>
                    <p className="text-xs font-black uppercase tracking-widest text-primary mt-1">{member.role}</p>
                 </div>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed italic">{member.bio}</p>
              </div>
            ))}
         </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
         <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Join our journey.</h2>
         <p className="text-slate-500 font-medium italic">We're always looking for strategic partners and exceptional talent.</p>
         <div className="flex justify-center gap-4">
            <Link href="/auth?mode=signup">
               <Button className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">Get Started</Button>
            </Link>
            <Link href="/careers">
               <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px]">View Careers</Button>
            </Link>
         </div>
      </div>
    </div>
  )
}
