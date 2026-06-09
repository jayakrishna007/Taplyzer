"use client"

import { 
  ShieldCheck, Lock, Eye, CheckCircle2, 
  Award, FileText, Server, Users, 
  ShieldAlert, Fingerprint, Zap, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PILLARS = [
  {
    title: "Multi-Factor Verification",
    desc: "Every business profile is vetted against official registration documents, website history, and professional social signals.",
    icon: Fingerprint,
    color: "text-blue-500"
  },
  {
    title: "Zero-Knowledge Intent",
    desc: "Your strategic goals are only revealed to businesses that pass our high-alignment matching threshold.",
    icon: Eye,
    color: "text-primary"
  },
  {
    title: "Secure Introductions",
    desc: "All initial communications happen through our secure intro layer, protecting your contact details until you're ready to meet.",
    icon: Lock,
    color: "text-purple-500"
  },
  {
    title: "Integrity Scores",
    desc: "Businesses are continuously rated on communication reliability and deal integrity by the community.",
    icon: Award,
    color: "text-emerald-500"
  }
]

export default function TrustSecurityPage() {
  return (
    <div className="py-24 space-y-32">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          Platform <span className="text-primary">Trust.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
          Security isn't just a feature; it's the foundation of the Taplyzer networking ecosystem.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        {PILLARS.map(pillar => (
          <div key={pillar.title} className="p-12 rounded-[3rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-100/50 dark:shadow-none hover:border-primary/50 transition-all duration-500 flex flex-col items-center text-center space-y-6">
             <div className={`h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center ${pillar.color}`}>
                <pillar.icon className="h-10 w-10" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">{pillar.title}</h3>
             <p className="text-lg font-medium text-slate-500 leading-relaxed italic">{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* Compliance Section */}
      <div className="max-w-5xl mx-auto px-4 bg-slate-50 dark:bg-white/5 rounded-[4rem] p-12 md:p-20 border border-slate-100 dark:border-white/10 flex flex-col md:flex-row gap-16 items-center">
         <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Global Standards.</h2>
            <div className="space-y-4">
               {[
                 "GDPR & CCPA Compliant",
                 "AES-256 Data Encryption",
                 "ISO 27001 Certified Infrastructure",
                 "Regular 3rd-party Security Audits"
               ].map(item => (
                 <div key={item} className="flex items-center gap-4 text-slate-600 dark:text-slate-400 font-bold italic">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    {item}
                 </div>
               ))}
            </div>
            <Link href="/privacy" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
               Read Privacy Policy <ArrowRight className="h-4 w-4" />
            </Link>
         </div>
         <div className="flex-1 flex items-center justify-center relative">
            <ShieldCheck className="h-48 w-48 text-primary opacity-10" />
            <div className="absolute inset-0 flex items-center justify-center">
               <ShieldAlert className="h-24 w-24 text-primary animate-pulse" />
            </div>
         </div>
      </div>
    </div>
  )
}
