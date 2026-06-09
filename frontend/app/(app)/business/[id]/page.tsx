"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import {
   Building2, MapPin, Globe, Users, CheckCircle2,
   Target, Zap, Star, MessageSquare, ArrowLeft, ArrowRight,
   ShieldCheck, Award, TrendingUp, Clock, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RequestIntroModal } from "@/components/modals/request-intro-modal"

const MOCK_BUSINESSES: Record<string, any> = {
   "1": {
      name: "Nexus Technologies",
      industry: "Enterprise Software",
      location: "San Francisco, CA",
      tagline: "Helping enterprises modernize infrastructure and scale cloud systems.",
      about: "Nexus Technologies is a premier cloud infrastructure firm specializing in enterprise-grade modernization, DevOps automation, and cloud-native application development. With over a decade of experience, we've helped Fortune 500 companies migrate and scale their most critical systems.",
      offerings: ["Cloud Infrastructure", "DevOps Automation", "System Migration", "Kubernetes Consulting"],
      needs: ["Implementation Partners", "B2B Clients", "Sales Agencies", "Strategic Investors"],
      goal: "Looking for cloud infrastructure solutions to scale their B2B platform and expanding into the APAC region.",
      verified: true,
      rating: 4.8,
      reviews: 42,
      teamSize: "50-200",
      website: "nexus-tech.io",
      founded: "2014"
   },
   "2": {
      name: "Elevate Marketing Group",
      industry: "Marketing Agency",
      location: "New York, NY",
      tagline: "Data-driven marketing for high-growth SaaS.",
      about: "Elevate is a results-oriented marketing agency that combines creative excellence with rigorous data analysis. We specialize in scaling SaaS companies through performance marketing, SEO, and conversion rate optimization.",
      offerings: ["Paid Ads", "SEO", "Lead Generation", "Content Strategy"],
      needs: ["CRM Developers", "SaaS Tools", "Partnerships", "AI Content Tools"],
      goal: "Seeking a reliable SaaS CRM integration partner for our growing portfolio of international clients.",
      verified: true,
      rating: 4.6,
      reviews: 120,
      teamSize: "10-50",
      website: "elevate-mkt.com",
      founded: "2018"
   }
}

export default function BusinessProfilePage() {
   const params = useParams()
   const router = useRouter()
   const searchParams = useSearchParams()
   const fromMatches = searchParams.get("from") === "matches"

   const id = params.id as string
   const business = MOCK_BUSINESSES[id] || MOCK_BUSINESSES["1"] // Fallback to id 1 for demo

   const [isIntroModalOpen, setIsIntroModalOpen] = useState(false)

   return (
      <div className="max-w-5xl mx-auto space-y-8 pb-32">
         {/* Navigation */}
         <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2"
         >
            <ArrowLeft className="h-4 w-4" /> Back to Discover
         </Button>

         {/* Header Card */}
         <div className="bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
               <Building2 className="h-64 w-64 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
               <div className="h-28 w-28 md:h-36 md:w-36 rounded-[2rem] md:rounded-[3rem] bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-5xl font-black text-primary italic shadow-inner">
                  {business.name[0]}
               </div>
               <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic flex items-center gap-3">
                           {business.name}
                           {business.verified && <CheckCircle2 className="h-8 w-8 text-emerald-500" />}
                        </h1>
                        <p className="text-xl font-bold text-primary mt-1">{business.industry}</p>
                     </div>
                     <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                        <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                        <span className="font-black text-amber-700 dark:text-amber-500 text-lg">{business.rating}</span>
                        <span className="text-xs font-bold text-amber-600/60 ml-1">({business.reviews} reviews)</span>
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                     <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span className="font-bold text-sm">{typeof business.location === 'string' ? business.location : `${business.location?.city || ''}${business.location?.city && business.location?.country ? ', ' : ''}${business.location?.country || ''}`}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Globe className="h-4 w-4" />
                        <span className="font-bold text-sm">{business.website}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Users className="h-4 w-4" />
                        <span className="font-bold text-sm">{business.teamSize} employees</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span className="font-bold text-sm">Founded {business.founded}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               {/* Why You Match (Only from Matches) */}
               {fromMatches && (
                  <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 space-y-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Zap className="h-4 w-4 fill-primary" /> Strategic Alignment
                     </h3>
                     <div className="space-y-2">
                        <p className="text-xl font-bold text-slate-900 dark:text-white italic">"High synergy detected in Cloud Security & B2B Scaling needs."</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                           Nexus Technologies' current goal perfectly aligns with your expertise in APAC market expansion and infrastructure deployment. We recommend initiating a partnership discussion.
                        </p>
                     </div>
                     <div className="flex items-center gap-4 pt-2">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-black bg-slate-200 dark:bg-white/10" />)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">3 mutual connections</span>
                     </div>
                  </div>
               )}

               {/* Company Overview */}
               <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 md:p-10 shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <Building2 className="h-4 w-4" /> Company Overview
                  </h3>
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                     {business.about}
                  </p>
                  <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                     <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 italic tracking-tight">Mission Statement</h4>
                     <p className="text-sm font-medium text-slate-500 leading-relaxed">To accelerate the world's transition to cloud-native infrastructure through seamless automation and expert engineering.</p>
                  </div>
               </div>

               {/* Offerings & Needs */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 shadow-sm space-y-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" /> Core Offerings
                     </h3>
                     <div className="flex flex-col gap-3">
                        {business.offerings.map((off: string) => (
                           <div key={off} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                 <Check className="h-3 w-3" />
                              </div>
                              <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{off}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 shadow-sm space-y-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-500" /> Current Needs
                     </h3>
                     <div className="flex flex-col gap-3">
                        {business.needs.map((need: string) => (
                           <div key={need} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                              <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                 <Check className="h-3 w-3" />
                              </div>
                              <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{need}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               {/* CTA Card */}
               <div className="bg-slate-900 dark:bg-primary rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-primary/20 space-y-8 sticky top-28">
                  <div className="space-y-2">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">Current Goal</h3>
                     <p className="text-2xl font-black italic tracking-tighter text-white leading-tight">
                        "{business.goal}"
                     </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Deal Urgency</span>
                        <Badge className="bg-white/20 text-white border-none uppercase text-[8px] font-black tracking-widest">High</Badge>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Match Confidence</span>
                        <span className="text-white font-black italic">94%</span>
                     </div>
                  </div>

                  <Button
                     onClick={() => setIsIntroModalOpen(true)}
                     className="w-full h-16 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                     Request Introduction <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 text-center">
                     NO INTRO FEE • VERIFIED BUSINESS ONLY
                  </p>
               </div>

               {/* Trust Metrics */}
               <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4 text-emerald-500" /> Trust Metrics
                  </h3>
                  <div className="space-y-4">
                     {[
                        { label: "Reliability", score: 98 },
                        { label: "Communication", score: 95 },
                        { label: "Integrity", score: 100 }
                     ].map(m => (
                        <div key={m.label} className="space-y-1.5">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-500">{m.label}</span>
                              <span className="text-slate-900 dark:text-white">{m.score}%</span>
                           </div>
                           <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${m.score}%` }} />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Verification Badge Tooltip Area */}
               <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Verified Trusted Partner</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-2 leading-relaxed">
                     Taplyzer reviewed selected business information. Not a guarantee.
                  </p>
               </div>
            </div>
         </div>

         <RequestIntroModal
            open={isIntroModalOpen}
            onClose={() => setIsIntroModalOpen(false)}
            company={{ id: id, name: business.name, industry: business.industry, verified: business.verified }}
         />
      </div>
   )
}
