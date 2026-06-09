"use client"

import { Cookie, ShieldCheck, Settings, Eye, Clock, CheckCircle2 } from "lucide-react"

export default function CookiePolicyPage() {
  return (
    <div className="py-24 max-w-4xl mx-auto px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic">Cookie <span className="text-primary">Policy.</span></h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2">
           <Clock className="h-3.5 w-3.5" /> Effective: April 2024
        </p>
      </div>

      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 md:p-16 space-y-10 shadow-sm">
         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Cookie className="h-6 w-6 text-primary" /> 1. What are Cookies?
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               Cookies are small text files stored on your device that help us provide a better experience. They allow us to remember your login state, theme preferences, and platform settings across sessions.
            </p>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Settings className="h-6 w-6 text-primary" /> 2. How We Use Them
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               We use cookies for essential functionality, security, and performance analysis. This includes:
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 pt-4">
               {[
                 "Authentication & Security", "User Preferences (Dark Mode)", "Session Persistence", "Performance Monitoring", "Anti-fraud measures", "Core Platform Features"
               ].map(item => (
                 <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {item}
                 </li>
               ))}
            </ul>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <Eye className="h-6 w-6 text-primary" /> 3. Third-Party Cookies
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               We may use third-party analytics services (like Google Analytics) to help us understand how the platform is used. These services may set their own cookies according to their privacy policies.
            </p>
         </section>

         <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               <ShieldCheck className="h-6 w-6 text-primary" /> 4. Managing Preferences
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed italic">
               You can manage or disable cookies through your browser settings. However, please note that some parts of the Taplyzer platform may not function correctly without essential cookies.
            </p>
         </section>
      </div>

      <div className="text-center">
         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cookie questions? Reach out at <span className="text-primary">support@taplyzer.io</span></p>
      </div>
    </div>
  )
}
