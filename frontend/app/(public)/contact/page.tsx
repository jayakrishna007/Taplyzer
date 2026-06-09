"use client"

import { useState } from "react"
import { 
  Mail, MessageSquare, MapPin, Globe, 
  Send, CheckCircle2, ChevronRight, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="py-24 space-y-32">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          Get in <span className="text-primary">Touch.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
          Questions about enterprise solutions or strategic partnerships? Our team is ready to assist.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">
         {/* Contact Info */}
         <div className="space-y-12">
            <div className="space-y-8">
               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Connect with us.</h2>
               <div className="grid gap-6">
                  {[
                    { label: "General Inquiry", val: "hello@taplyzer.io", icon: Mail },
                    { label: "Strategic Support", val: "partners@taplyzer.io", icon: Zap },
                    { label: "Office Hub", val: "Silicon Valley, CA / Remote", icon: MapPin }
                  ].map(item => (
                    <div key={item.label} className="p-8 rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 flex items-center gap-6 shadow-sm">
                       <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary">
                          <item.icon className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">{item.val}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="p-10 rounded-[3rem] bg-slate-900 dark:bg-primary text-white shadow-2xl shadow-primary/20 space-y-6">
               <h3 className="text-2xl font-black italic tracking-tight">Need a demo?</h3>
               <p className="text-white/60 font-medium italic leading-relaxed">Book a personalized walkthrough of our enterprise networking platform with one of our strategic advisors.</p>
               <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-[11px] shadow-xl">
                  Schedule Demo <ChevronRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
         </div>

         {/* Contact Form */}
         <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-[4rem] p-10 md:p-16 shadow-xl shadow-slate-100/50 dark:shadow-none">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                          <Input required placeholder="John Doe" className="h-14 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                          <Input required type="email" placeholder="john@company.com" className="h-14 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                       <Input required placeholder="Enterprise Partnership" className="h-14 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                       <Textarea required placeholder="Tell us more about your inquiry..." className="min-h-[150px] bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold p-6 resize-none" />
                    </div>
                 </div>
                 <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                    Send Message <Send className="h-4 w-4" />
                 </Button>
              </form>
            ) : (
              <div className="py-20 text-center space-y-8 animate-in zoom-in-95 duration-700">
                 <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="h-12 w-12" />
                 </div>
                 <div className="space-y-3">
                    <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">Message Sent!</h2>
                    <p className="text-slate-500 font-bold max-w-sm mx-auto">Thank you for reaching out. A strategic advisor will get back to you within 24 hours.</p>
                 </div>
                 <Button onClick={() => setSubmitted(false)} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Send another message
                 </Button>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
