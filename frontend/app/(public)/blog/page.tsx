"use client"

import { 
  Zap, Calendar, User, ArrowRight, Search, 
  ChevronRight, TrendingUp, Sparkles, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const POSTS = [
  {
    id: 1,
    title: "The Future of B2B Networking is Intent-Based",
    excerpt: "Why the traditional 'cold-outreach' model is dying and how Taplyzer is leading the shift towards strategic matchmaking.",
    author: "Saurav Kumar",
    date: "April 20, 2024",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "Scaling Your SaaS Through Strategic Partnerships",
    excerpt: "How to identify and approach the right partners to accelerate your market expansion without burning capital.",
    author: "Anjali Sharma",
    date: "April 15, 2024",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Verification & Trust: The New Currency of Networking",
    excerpt: "In a world of noise, trust is your most valuable asset. Learn how verified profiles get 3x more deal flow.",
    author: "Vikram Singh",
    date: "April 10, 2024",
    category: "Trust",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
  }
]

export default function BlogPage() {
  return (
    <div className="py-24 space-y-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
          Platform <span className="text-primary">Journal.</span>
        </h1>
        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
          Strategic insights, platform updates, and the future of business networking.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-4">
         <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input placeholder="Search articles..." className="w-full h-14 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 font-bold outline-none focus:border-primary transition-all" />
         </div>
         <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px] gap-2">
            <Filter className="h-4 w-4" /> All Categories
         </Button>
      </div>

      {/* Featured Grid */}
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {POSTS.map(post => (
           <div key={post.id} className="group cursor-pointer space-y-6">
              <div className="aspect-video bg-slate-100 dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 relative">
                 <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                 <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black uppercase text-[8px] tracking-widest px-3 py-1">
                       {post.category}
                    </Badge>
                 </div>
              </div>
              <div className="space-y-4 px-2">
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {post.author}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {post.date}</span>
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                 </h2>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed italic">{post.excerpt}</p>
                 <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                    Read Article <ArrowRight className="h-4 w-4" />
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Newsletter */}
      <div className="max-w-4xl mx-auto px-4 py-16">
         <div className="bg-slate-900 dark:bg-primary rounded-[3rem] p-12 text-center space-y-8 shadow-2xl shadow-primary/20">
            <Sparkles className="h-12 w-12 text-white mx-auto opacity-20" />
            <h2 className="text-3xl font-black italic tracking-tight text-white">Subscribe to the Strategic Network.</h2>
            <p className="text-white/60 font-medium italic">Get weekly insights on deal flow and networking strategy.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
               <input placeholder="Enter your email" className="flex-grow h-14 rounded-2xl bg-white/10 border border-white/20 px-6 text-white placeholder:text-white/30 outline-none focus:border-white transition-all font-bold" />
               <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px]">Subscribe</Button>
            </form>
         </div>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  )
}
