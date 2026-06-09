"use client"

import { Phone, Mail, FileText, CheckCircle2, ShieldAlert, Award } from "lucide-react"

const verificationMethods = [
  {
    icon: Phone,
    title: "Mobile Verification",
    description: "Every account is linked to a verified mobile number, eliminating bot networks and duplicate profiles.",
    color: "from-blue-500/10 to-indigo-500/5",
    iconColor: "text-blue-500"
  },
  {
    icon: Mail,
    title: "Business Email Verification",
    description: "Requires matching corporate domains for all registrations. Free/public email sign-ups are strictly blocked.",
    color: "from-emerald-500/10 to-teal-500/5",
    iconColor: "text-emerald-500"
  },
  {
    icon: FileText,
    title: "Company Profile Review",
    description: "Our compliance team reviews details like GST/incorporation or corporate registry records to confirm active standing.",
    color: "from-purple-500/10 to-violet-500/5",
    iconColor: "text-purple-500"
  },
  {
    icon: Award,
    title: "Website & LinkedIn Review",
    description: "All profile social links are vetted to guarantee alignment between company claims, services, and online authority.",
    color: "from-amber-500/10 to-orange-500/5",
    iconColor: "text-amber-500"
  }
]

export function Trust() {
  return (
    <section id="trust" className="relative py-24 lg:py-32 bg-white dark:bg-black transition-colors overflow-hidden">
      
      {/* Decorative Gradient Background divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black mb-6 uppercase tracking-widest">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            The Security Standard
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance leading-tight">
            Quality Over Quantity
          </h2>
          <p className="mt-6 text-lg text-slate-500 dark:text-white/50 font-semibold max-w-2xl mx-auto leading-relaxed">
            Taplyzer is focused on building a trusted business ecosystem. We verify every company so you can connect with greater confidence.
          </p>
        </div>

        {/* 4-Step Verification Grid & Side Banner */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Verification Methods Grid */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6 sm:gap-8">
            {verificationMethods.map((method, idx) => (
              <div
                key={idx}
                className="group bg-slate-50 dark:bg-[#0A0A0F] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 hover:border-emerald-500/30 hover:scale-[1.01] transition-all duration-300 shadow-sm dark:shadow-none"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${method.color} flex items-center justify-center border border-slate-200/50 dark:border-white/5 group-hover:scale-105 transition-transform`}>
                    <method.icon className={`h-6 w-6 ${method.iconColor}`} />
                  </div>
                  
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-emerald-500 transition-colors">
                  {method.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-white/40 leading-relaxed font-semibold">
                  {method.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Dynamic Assurance Callout */}
          <div className="lg:col-span-4 bg-gradient-to-tr from-slate-900 to-indigo-950 dark:from-[#08080C] dark:to-slate-900 border border-slate-200 dark:border-white/5 rounded-[36px] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden group">
            
            {/* Visual glow orbs inside callout */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px] pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-4">
                  100% VETTED commercial NETWORK
                </span>
                
                <h4 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white mb-6">
                  Connect with Greater Confidence
                </h4>
                
                <p className="text-sm text-white/60 font-semibold leading-relaxed mb-6">
                  We believe commercial collaborations shouldn&apos;t depend on luck. By maintaining a strict verification gate, Taplyzer blocks cold outreach spam bots and bad actors at the registration gate.
                </p>
              </div>

              <div className="border-t border-white/10 pt-6 mt-8 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Vetted Commercial Ecosystem
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  )
}
