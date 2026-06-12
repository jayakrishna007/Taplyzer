"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { MatchCard, type Match } from "@/components/dashboard/match-card"
import { IntroRequests } from "@/components/dashboard/intro-requests"
import { TrendingUp, Zap, CheckCircle2, Clock, ArrowRight, MessageSquare, Briefcase, Video, Info, FileText, Target, Users, MapPin, ArrowUpRight, Building2, RefreshCw, X, ShieldCheck, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { RequestIntroModal } from "@/components/modals/request-intro-modal"
import { ViewProfileModal } from "@/components/modals/view-profile-modal"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Removed suggestedMatches static array — real matches loaded from API

const recentActivity = [
  { id: 1, type: "request", content: "You received a request from FinBridge", time: "2 hours ago", icon: MessageSquare, color: "text-blue-500" },
  { id: 2, type: "meeting", content: "Meeting completed with AgroMax", time: "5 hours ago", icon: Briefcase, color: "text-emerald-500" },
  { id: 3, type: "rating", content: "New rating received (5★)", time: "1 day ago", icon: Target, color: "text-amber-500" },
]

const exploreTrending: Match[] = [
  {
    matchedUserId: "trending-1",
    companyName: "MedCore Systems",
    candidateName: "MedCore Systems",
    industry: "Healthcare Tech",
    location: "San Francisco, CA",
    score: 94,
    offerings: ["Medical Imaging API", "EHR Integration", "Telehealth Platform"],
    needs: ["Enterprise Hospitals", "Healthcare Compliance Consulting"],
    goal: "Expanding enterprise clinical integrations across regional hospitals.",
    offeringGoal: "Providing advanced, compliant medical imaging APIs and telemetry integrations.",
    reasons: ["Highly compatible with health systems", "Strong reputation"],
    verified: true,
    verificationStatus: "Business Verified",
    teamSize: "11-50"
  },
  {
    matchedUserId: "trending-2",
    companyName: "BrightChain Logistics",
    candidateName: "BrightChain Logistics",
    industry: "Supply Chain",
    location: "Chicago, IL",
    score: 88,
    offerings: ["Cold-Chain IoT Tracking", "Inventory Optimization AI"],
    needs: ["FMCG Manufacturers", "Warehouse partners"],
    goal: "Optimizing multi-modal logistics with predictive IoT telemetry.",
    offeringGoal: "Reducing food/pharma wastage via dynamic routing and IoT monitoring.",
    reasons: ["Perfect geographic alignment", "Validated tracking hardware"],
    verified: true,
    verificationStatus: "Trusted Partner",
    teamSize: "51-200"
  },
  {
    matchedUserId: "trending-3",
    companyName: "GreenLeaf Foods",
    candidateName: "GreenLeaf Foods",
    industry: "FMCG",
    location: "Austin, TX",
    score: 82,
    offerings: ["Organic Raw Materials", "Sustainable Packaging"],
    needs: ["Retail Distribution Partners", "Eco-friendly logistics"],
    goal: "Sourcing sustainable packaging options and local distributors.",
    offeringGoal: "Providing premium organic agricultural ingredients with full traceability.",
    reasons: ["High synergy with supply chain needs"],
    verified: false,
    verificationStatus: "Basic Partner",
    teamSize: "1-10"
  }
]

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [viewProfileMatch, setViewProfileMatch] = useState<Match | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [business, setBusiness] = useState<any>(null)
  const [meetings, setMeetings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showVerifyPopup, setShowVerifyPopup] = useState(false)
  const [showRefreshWarning, setShowRefreshWarning] = useState(false)

  const refreshMatches = async () => {
    if (!user?._id) return;
    setIsRefreshing(true);
    try {
      const freshRes = await fetch(`/api/matches/${user._id}`, { method: "POST" });
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        const seen = new Set<string>();
        const deduped = (freshData.matches || []).filter((m: any) => {
          const id = (m.matchedUserId ?? m._id ?? "").toString();
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setMatches(deduped.slice(0, 1));
        toast.success("Matches updated successfully!");
        window.location.reload();
      } else {
        toast.error("Failed to refresh matches");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh matches");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!user?._id) return;
      try {
        let matchesData: any = null;
        const [bizRes, matchesRes, meetingsRes] = await Promise.all([
          fetch(`/api/business/${user._id}`),
          fetch(`/api/matches/${user._id}`, { method: "GET" }),
          fetch(`/api/meetings`)
        ]);
        
        if (bizRes.ok) {
          const bizData = await bizRes.json();
          setBusiness(bizData);
        }
        
        if (matchesRes.ok) {
          matchesData = await matchesRes.json();
          
          // Fall back to POST to generate fresh cache if it's missing or stale
          if (!matchesData.matches || matchesData.matches.length === 0 || matchesData.meta?.isStale) {
            const freshRes = await fetch(`/api/matches/${user._id}`, { method: "POST" });
            if (freshRes.ok) {
              matchesData = await freshRes.json();
            }
          }
          
          const seen = new Set<string>();
          const deduped = (matchesData?.matches || []).filter((m: any) => {
            const id = (m.matchedUserId ?? m._id ?? "").toString();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          setMatches(deduped.slice(0, 1));
        }

        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json();
          setMeetings(meetingsData.meetings?.slice(0, 3) || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user?._id])

  useEffect(() => {
    if (isLoading || !user) return;
    const isSetupComplete = localStorage.getItem("taplyzer_setup_complete") === "true";
    const isDismissed = sessionStorage.getItem("taplyzer_verify_popup_dismissed") === "true";
    
    if (isSetupComplete && !user.verified && !isDismissed) {
      setShowVerifyPopup(true);
    }
  }, [isLoading, user]);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 italic">
            Hello, {user?.name || "User"} 👋
          </h1>
          {business ? (
            <p className="text-slate-500 dark:text-white/40 font-bold text-sm tracking-wide flex items-center gap-2">
              <Building2 className="h-4 w-4" /> {business.companyName} • <MapPin className="h-4 w-4" /> {business.location?.city || (typeof business.location === 'string' ? business.location : "Global")}
            </p>
          ) : (
            <p className="text-slate-500 dark:text-white/40 font-bold text-sm tracking-wide">
              You have new opportunities today.
            </p>
          )}
        </div>
         <div className="flex flex-wrap items-center gap-3">
            <Link href="/profile">
              <Button asChild variant="outline" className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                <span>Update Goal</span>
              </Button>
            </Link>
         </div>
      </div>

      {/* KPI Cards */}
      <StatsCards />

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Suggested Matches */}
          <section className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 p-5 md:p-6 rounded-3xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">Suggested Matches</h2>
                  <button
                    onClick={() => setShowRefreshWarning(true)}
                    disabled={isRefreshing || isLoading}
                    title="Recalculate matches"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-primary transition-all hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <Badge variant="outline" className="border-primary/20 text-primary uppercase font-black text-[9px] tracking-widest">High Intent</Badge>
              </div>
              
              <div className="grid gap-4 mb-4">
                {isLoading ? (
                  <div className="py-10 text-center"><p className="text-slate-500 font-bold">Finding matches...</p></div>
                ) : matches.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-slate-500 font-bold mb-4">No matches found yet.</p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm">Complete your profile to get matches</Button>
                    </Link>
                  </div>
                ) : (
                  matches.map((match, idx) => (
                    <MatchCard 
                      key={`${match.matchedUserId?.toString() ?? "match"}-${idx}`} 
                      match={match} 
                      onRequestIntro={() => {
                        setSelectedCompany({ 
                          id: match.matchedUserId, 
                          name: match.companyName || match.candidateName, 
                          industry: match.industry, 
                          verified: match.verified,
                          matchScore: match.score
                        });
                        setIsModalOpen(true);
                      }} 
                      onViewProfile={(m) => {
                        setViewProfileMatch(m);
                        setIsProfileOpen(true);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            <Link href="/matches">
              <Button variant="ghost" className="w-full h-11 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                View All Matches <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </section>
        </div>

        <div>
          {/* Explore Opportunities Widget */}
          <section className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 p-5 md:p-6 rounded-3xl h-full flex flex-col justify-between">
             <div>
               <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic mb-4">Explore Trending</h2>
               <div className="grid grid-cols-1 gap-3.5 mb-4">
                 {exploreTrending.slice(0, 2).map(t => (
                   <div key={t.matchedUserId} className="p-4 border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] rounded-xl hover:border-primary/30 transition-colors">
                      <h4 className="font-black text-slate-900 dark:text-white mb-0.5 truncate text-sm">{t.companyName}</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 block">{t.industry}</span>
                      <div className="flex gap-2">
                         <Button 
                           size="sm" 
                           variant="outline" 
                           className="flex-1 h-8 text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-white/10"
                           onClick={() => {
                             setViewProfileMatch(t);
                             setIsProfileOpen(true);
                           }}
                         >
                           Profile
                         </Button>
                         <Link href="/explore" className="flex-1">
                           <Button asChild size="sm" className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-primary text-white"><span>Explore</span></Button>
                         </Link>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          </section>
        </div>
      </div>

      {/* Bottom Row: 4 Widgets in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <IntroRequests />

         {/* Upcoming Meetings Widget */}
         <Card className="p-6 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight italic">Upcoming Meetings</h3>
                <Link href="/meetings">
                  <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest text-primary p-0 h-auto hover:bg-transparent">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                 {meetings.length === 0 ? (
                   <p className="text-xs font-medium text-slate-400 text-center py-4 italic">No upcoming meetings</p>
                 ) : (
                   meetings.map(m => (
                      <div key={m._id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                               <Video className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                               <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                 {m.organizerId?._id === user?._id ? (m.connectionId?.userBBizName || "Meeting") : (m.connectionId?.userABizName || "Meeting")}
                               </h4>
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mt-0.5">
                                 <Clock className="h-3 w-3"/> {new Date(m.startTime).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                               </span>
                            </div>
                         </div>
                         <div className="flex gap-2 mt-2">
                            <a href={m.meetLink} target="_blank" rel="noopener noreferrer" className="w-full">
                              <Button size="sm" className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white transition-all">Join</Button>
                            </a>
                         </div>
                      </div>
                   ))
                 )}
              </div>
            </div>
         </Card>

         {/* Performance Insights */}
         <Card className="p-6 bg-slate-900 dark:bg-primary/10 border-none rounded-[2rem] text-white flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black tracking-tight italic mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-amber-400" /> Performance Insights</h3>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3">
                   <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                   <p className="text-xs font-medium text-white/80 leading-relaxed">Verified businesses receive <strong className="text-white">2x more requests</strong>. Complete your verification.</p>
                 </li>
                 <li className="flex items-start gap-3">
                   <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                   <p className="text-xs font-medium text-white/80 leading-relaxed">Add current goal to improve your matching score across the network.</p>
                 </li>
                 <li className="flex items-start gap-3">
                   <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                   <p className="text-xs font-medium text-white/80 leading-relaxed">Respond faster to increase your ranking in Explore feeds.</p>
                 </li>
              </ul>
            </div>
         </Card>

         {/* Recent Activity */}
         <Card className="p-6 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem] flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight italic mb-5">Recent Activity</h3>
              <div className="space-y-4">
                 {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-primary/20 transition-all">
                       <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 shadow-sm`}>
                          <act.icon className={`h-4 w-4 ${act.color}`} />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">{act.content}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 block">{act.time}</span>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
         </Card>
      </div>

      {selectedCompany && (
        <RequestIntroModal 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          company={selectedCompany} 
        />
      )}

      {viewProfileMatch && (
        <ViewProfileModal
          open={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          match={viewProfileMatch}
          onRequestIntro={() => {
            setSelectedCompany({
              id: viewProfileMatch.matchedUserId,
              name: viewProfileMatch.companyName || viewProfileMatch.candidateName,
              industry: viewProfileMatch.industry,
              verified: viewProfileMatch.verified,
              matchScore: viewProfileMatch.score,
            });
            setIsModalOpen(true);
          }}
        />
      )}

      {showVerifyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Chrome-style close button — top-right, always visible */}
            <button
              onClick={() => {
                setShowVerifyPopup(false);
                sessionStorage.setItem("taplyzer_verify_popup_dismissed", "true");
              }}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors shadow"
            >
              <X className="h-3.5 w-3.5 text-red-500" />
            </button>

            <div className="p-10 pt-14 text-center space-y-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Get Verified for Free</h2>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                  Verified business profiles get <span className="font-black text-emerald-500">80% more deals</span> than unverified ones.
                  Stand out and attract serious partners.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {["80% Deals", "Verified Badge", "Instant Match"].map(s => (
                  <div key={s} className="p-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex flex-col justify-center items-center">
                    <Check className="h-3.5 w-3.5 text-emerald-500 mb-1" />
                    <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-center leading-tight">{s}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => {
                    setShowVerifyPopup(false);
                    sessionStorage.setItem("taplyzer_verify_popup_dismissed", "true");
                    router.push("/dashboard/verify");
                  }}
                  className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  Verify My Business Profile — Free <ShieldCheck className="h-4 w-4 ml-2" />
                </Button>
                <button
                  onClick={() => {
                    setShowVerifyPopup(false);
                    sessionStorage.setItem("taplyzer_verify_popup_dismissed", "true");
                  }}
                  className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                  Skip for now, go to Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showRefreshWarning} onOpenChange={setShowRefreshWarning}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 gap-6 border-none shadow-2xl bg-white dark:bg-[#0A0A0A]">
          <DialogTitle className="text-xl font-black italic text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            ⚠️ Recalculate Warning
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 dark:text-white/60 leading-relaxed">
            Warning: By refreshing the page, the content profiles and suggested matches may change. Do you wish to proceed?
          </DialogDescription>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRefreshWarning(false)}
              className="flex-1 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowRefreshWarning(false);
                refreshMatches();
              }}
              className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
              Refresh
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
