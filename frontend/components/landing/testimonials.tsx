"use client"

import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    content: "Taplyzer transformed how we handle strategic acquisitions. The intent engine found us a perfect SaaS partner in less than 72 hours. Simply incredible.",
    author: "Sarah Jenkins",
    role: "CEO, TechFlow Solutions",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    content: "The level of verification on this platform is unmatched. We closed a $2M seed round with investors we never would have found on LinkedIn.",
    author: "Marcus Chen",
    role: "Founder, GrowthMetrics",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
  },
  {
    content: "Finally, a networking platform that actually focuses on business deals instead of social vanity. The ROI on our subscription was 10x in the first month.",
    author: "Elena Rodriguez",
    role: "Director of M&A, CloudScale",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
  }
]

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge className="bg-primary/10 text-primary border-none mb-6 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
            Trusted by <span className="text-primary italic">Deal Makers</span> worldwide.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="relative p-10 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 group hover:bg-white dark:hover:bg-white/10 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-primary/10">
              <Quote className="absolute top-8 right-8 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-8 italic leading-relaxed">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <img src={t.image} alt={t.author} className="h-12 w-12 rounded-full border-2 border-primary/20" />
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">{t.author}</h4>
                  <p className="text-slate-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
