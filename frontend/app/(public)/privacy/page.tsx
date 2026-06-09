"use client"

import { ShieldCheck, FileText, Lock, Globe, Clock, CheckCircle2 } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="py-24 max-w-4xl mx-auto px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic">Privacy <span className="text-primary">Policy.</span></h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2">
           <Clock className="h-3.5 w-3.5" /> Last Updated: April 2024
        </p>
      </div>

      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 md:p-16 space-y-10 shadow-sm">
         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <ShieldCheck className="h-6 w-6 text-primary" /> 1. Overview
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               Taplyzer ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website and platform.
            </p>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <FileText className="h-6 w-6 text-primary" /> 2. Information We Collect
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               We collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with other businesses. This includes:
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 pt-4">
               {[
                 "Account credentials", "Business registration details", "Strategic intent data", "Professional social profiles", "Communication logs", "Payment information"
               ].map(item => (
                 <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {item}
                 </li>
               ))}
            </ul>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Lock className="h-6 w-6 text-primary" /> 3. Data Security
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               We implement robust security measures to protect your data, including AES-256 encryption for data at rest and TLS for data in transit. Our infrastructure is hosted in ISO 27001 certified data centers.
            </p>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Globe className="h-6 w-6 text-primary" /> 4. Your Rights
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               Depending on your location (e.g., GDPR or CCPA), you may have the right to access, correct, or delete your personal data. You can manage most of these settings directly from your account dashboard.
            </p>
         </section>
      </div>

      <div className="text-center">
         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Questions about your privacy? Contact us at <span className="text-primary">privacy@taplyzer.io</span></p>
      </div>
    </div>
  )
}
