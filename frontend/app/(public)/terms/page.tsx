"use client"

import { FileText, ShieldAlert, Scale, Globe, Clock, CheckCircle2 } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="py-24 max-w-4xl mx-auto px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic">Terms of <span className="text-primary">Service.</span></h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2">
           <Clock className="h-3.5 w-3.5" /> Effective: April 2024
        </p>
      </div>

      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 md:p-16 space-y-10 shadow-sm">
         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Scale className="h-6 w-6 text-primary" /> 1. Acceptance of Terms
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               By accessing or using the Taplyzer platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
            </p>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <ShieldAlert className="h-6 w-6 text-primary" /> 2. Eligibility & Verification
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               The platform is intended for use by legitimate business entities. You represent that you have the authority to bind your organization to these terms. All accounts are subject to our verification process.
            </p>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Globe className="h-6 w-6 text-primary" /> 3. Prohibited Conduct
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               You agree not to use the platform for any illegal purpose, to spam other users, or to provide false information during the verification process. Taplyzer reserves the right to terminate any account that violates these standards.
            </p>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <FileText className="h-6 w-6 text-primary" /> 4. Limitation of Liability
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               Taplyzer provides a platform for business introductions. We are not responsible for the outcome of any deals, partnerships, or agreements made between users of the platform.
            </p>
         </section>
      </div>

      <div className="text-center">
         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Legal concerns? Reach our legal team at <span className="text-primary">legal@taplyzer.io</span></p>
      </div>
    </div>
  )
}
