import { Users, Zap, MessageSquare, Calendar, TrendingUp, Star, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

export function StatsCards() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/dashboard/stats/${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [user?._id])

  const getIcon = (name: string) => {
    switch (name) {
      case "Total Matches": return Users;
      case "New Opportunities": return Zap;
      case "Pending Requests": return MessageSquare;
      case "Meetings This Week": return Calendar;
      case "Deals In Progress": return TrendingUp;
      case "Trust Rating": return Star;
      default: return Zap;
    }
  }

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = getIcon(stat.name);
        return (
          <Link href={stat.href} key={stat.name} prefetch={true} className="block">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-7 hover:border-primary/50 hover:shadow-xl transition-all group h-full">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(3,169,244,0.1)] group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  stat.change === "Verified" 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : stat.changeType === "positive" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-6">
                <p className={`text-3xl font-black tracking-tighter ${
                  stat.name === "Trust Rating" ? "text-amber-500" : "text-slate-900 dark:text-white"
                }`}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-white/40 font-black uppercase tracking-widest mt-2">{stat.name}</p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
