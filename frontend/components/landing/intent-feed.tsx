"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Zap, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

const intents = [
  {
    id: 1,
    type: "Acquisition",
    title: "SaaS Platform looking for AI Integration partner",
    description: "Budget $500k - $1M. Focus on generative text models for customer support automation.",
    tags: ["SaaS", "AI", "Acquisition"],
    urgency: "High",
    matchScore: 98,
  },
  {
    id: 2,
    type: "Investment",
    title: "Fintech Startup raising Seed Round",
    description: "Seeking $2M for expansion into European markets. Lead investor already committed.",
    tags: ["Fintech", "Seed", "Expansion"],
    urgency: "Medium",
    matchScore: 92,
  },
  {
    id: 3,
    type: "Strategic Partnership",
    title: "Logistics provider seeking Last-Mile Tech",
    description: "Looking to integrate automated routing software for 500+ vehicle fleet.",
    tags: ["Logistics", "IoT", "Partnership"],
    urgency: "Immediate",
    matchScore: 95,
  }
]

export function IntentFeed() {
  return (
    <section className="py-24 bg-white dark:bg-black overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <Badge className="bg-primary/10 text-primary border-none mb-4 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              Live Intent Feed
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              The pulse of <span className="text-primary italic">global business</span> intent.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              Real-time needs from verified businesses. Every card represents a high-impact deal waiting to happen.
            </p>
          </div>
          <Link href="/auth?mode=signup">
            <Button className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl px-8 h-14 group">
              View All Intents
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {intents.map((intent) => (
            <Card key={intent.id} className="relative bg-slate-50 dark:bg-white/5 border-none p-8 rounded-3xl group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(3,169,244,0.1)] transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                  {intent.type}
                </Badge>
                <div className="flex items-center gap-1 text-primary">
                  <Zap className="h-4 w-4 fill-primary" />
                  <span className="font-black text-xs">{intent.matchScore}% Match</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">
                {intent.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                {intent.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {intent.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">#{tag}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Urgency</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${intent.urgency === 'High' || intent.urgency === 'Immediate' ? 'text-red-500' : 'text-amber-500'}`}>
                    {intent.urgency}
                  </span>
                </div>
                <Link href="/auth?mode=signup">
                  <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary font-black text-xs uppercase tracking-widest rounded-lg">
                    Apply Now
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
