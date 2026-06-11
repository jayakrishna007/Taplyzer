"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search, Filter, MapPin, Building2, CheckCircle2, LayoutList,
  LayoutPanelLeft, TableProperties, TrendingUp, Users, Check, Clock, Target, Sparkles,
  Briefcase, ShieldCheck, Send, Zap, Compass
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { RequestIntroModal } from "@/components/modals/request-intro-modal"
import { ViewProfileModal } from "@/components/modals/view-profile-modal"
import { type Match } from "@/components/dashboard/match-card"
import { EmptyState } from "@/components/ui/empty-state"

const INTENT_MAP: Record<string, string[]> = {
  "doctor": ["healthcare", "hospital", "clinic", "medical"],
  "restaurant": ["food", "beverage", "dining", "catering", "hospitality"],
  "builder": ["construction", "real estate", "contractor", "architect", "infrastructure"],
  "gym": ["fitness", "health", "sports", "wellness"],
  "investor": ["funding", "vc", "angel", "finance", "capital"],
  "manu": ["manufacturing", "manufacturers", "manual services", "production", "factory"],
  "software": ["saas", "tech", "it", "development", "app", "software company"],
  "marketing": ["seo", "ads", "agency", "branding", "growth"]
};

const SUGGESTED_SEARCHES = [
  "SaaS", "Agencies", "Manufacturers", "Bangalore", "Looking for clients", "Verified businesses"
];

const MOCK_OPPORTUNITIES = [
  {
    id: 1,
    companyName: "Nexus Technologies",
    userName: "Alex Chen",
    tagline: "Helping enterprises modernize infrastructure and scale cloud systems.",
    industry: "Enterprise Software",
    team: "50-200",
    city: "San Francisco",
    state: "CA",
    goal: "Looking for cloud infrastructure solutions to scale their B2B platform.",
    about: "Nexus Technologies is a premier cloud infrastructure firm specializing in enterprise-grade modernization.",
    needs: ["Implementation Partners", "B2B Clients", "Sales Agencies"],
    offers: ["Cloud Infrastructure", "DevOps", "Migration"],
    dealType: "Client",
    budget: "$85,000",
    verified: true,
    rating: 4.8,
    clients: 42,
    replyTime: "6 hrs",
    postedTime: "2 hours ago",
    urgency: "High",
    isTrending: true,
    category: "software"
  },
  {
    id: 2,
    companyName: "Elevate Marketing Group",
    userName: "Sarah Jenkins",
    tagline: "Data-driven marketing for high-growth SaaS.",
    industry: "Marketing Agency",
    team: "10-50",
    city: "New York",
    state: "NY",
    goal: "Seeking a reliable SaaS CRM integration partner for our growing portfolio.",
    about: "Elevate Marketing Group provides end-to-end performance marketing and CRM solutions.",
    needs: ["CRM Developers", "SaaS Tools", "Partnerships"],
    offers: ["Paid Ads", "SEO", "Lead Generation"],
    dealType: "Partnership",
    budget: "$25,000",
    verified: true,
    rating: 4.6,
    clients: 120,
    replyTime: "2 hrs",
    postedTime: "5 hours ago",
    urgency: "Medium",
    isTrending: true,
    category: "marketing"
  },
  {
    id: 3,
    companyName: "Apex Manufacturing",
    userName: "Marcus Vane",
    tagline: "Next-gen supply chain and automated manufacturing.",
    industry: "Manufacturing",
    team: "500+",
    city: "Chicago",
    state: "IL",
    goal: "Need an enterprise-grade ERP solution deployed within 3 months.",
    about: "Apex Manufacturing operates 12 facilities across the midwest.",
    needs: ["ERP Solutions", "Logistics Software", "Consultants"],
    offers: ["OEM Production", "Bulk Supply", "Packaging"],
    dealType: "Client",
    budget: "$120,000",
    verified: false,
    rating: 4.2,
    clients: 15,
    replyTime: "24 hrs",
    postedTime: "1 day ago",
    urgency: "High",
    isTrending: false,
    category: "manufacturing"
  },
  {
    id: 4,
    companyName: "CarePlus Healthcare",
    userName: "Dr. Emily Chen",
    tagline: "Modern healthcare clinics.",
    industry: "Healthcare",
    team: "50-200",
    city: "Boston",
    state: "MA",
    goal: "Looking for digital marketing agencies to increase patient acquisition.",
    about: "CarePlus operates a network of 5 modern clinics in the Boston area.",
    needs: ["Marketing Agency", "Patient Portal Software", "SEO"],
    offers: ["Medical Services", "Corporate Health Plans"],
    dealType: "Client",
    budget: "$15,000/mo",
    verified: true,
    rating: 4.9,
    clients: 5000,
    replyTime: "12 hrs",
    postedTime: "3 days ago",
    urgency: "Medium",
    isTrending: false,
    category: "healthcare"
  },
  {
    id: 5,
    companyName: "BuildRight Construction",
    userName: "Tom Hanks",
    tagline: "Commercial real estate developers.",
    industry: "Construction",
    team: "200-500",
    city: "Austin",
    state: "TX",
    goal: "Seeking materials suppliers and architectural design partners for new tech park.",
    about: "BuildRight is a leading commercial developer in Texas.",
    needs: ["Suppliers", "Architects", "Project Management Software"],
    offers: ["Commercial Leasing", "Construction Contracts"],
    dealType: "Partnership",
    budget: "$5M+",
    verified: true,
    rating: 4.7,
    clients: 80,
    replyTime: "48 hrs",
    postedTime: "1 week ago",
    urgency: "Low",
    isTrending: false,
    category: "construction"
  },
  {
    id: 6,
    companyName: "Tasteful Catering",
    userName: "Julia Child",
    tagline: "Premium corporate event catering.",
    industry: "Food & Beverage",
    team: "10-50",
    city: "Seattle",
    state: "WA",
    goal: "Looking for corporate clients and event management partners.",
    about: "Tasteful Catering provides high-end culinary experiences for corporate events.",
    needs: ["Corporate Clients", "Event Managers", "Kitchen Equipment"],
    offers: ["Catering Services", "Event Planning"],
    dealType: "Vendor",
    budget: "Varies",
    verified: false,
    rating: 4.5,
    clients: 300,
    replyTime: "1 hr",
    postedTime: "4 hours ago",
    urgency: "High",
    isTrending: true,
    category: "food"
  }
];

type ViewMode = "feed" | "split" | "table";

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchState, setSearchState] = useState<"exact" | "related" | "empty" | "none">("none");
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getGradientClass = (name: string) => {
    const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const gradients = [
      "from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500",
      "from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-400",
      "from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500",
      "from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400",
      "from-fuchsia-600 to-pink-500 dark:from-fuchsia-500 dark:to-pink-400"
    ]
    return gradients[charCodeSum % gradients.length]
  }

  const renderVerificationBadge = (verified?: boolean, status?: string) => {
    if (status === "Trusted Partner") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
          <ShieldCheck className="h-3 w-3" /> Trusted Partner
        </Badge>
      )
    }
    if (status === "Business Verified" || verified) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> Verified Business
        </Badge>
      )
    }
    return (
      <Badge className="bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10 flex items-center gap-1 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
        Basic Partner
      </Badge>
    )
  }

  useEffect(() => {
    async function fetchExplore() {
      try {
        const res = await fetch("/api/explore");
        const data = await res.json();
        if (data.businesses) {
          setAllBusinesses(data.businesses);
          setResults(data.businesses);
        }
      } catch (err) {
        console.error("Failed to fetch explore businesses:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExplore();
  }, []);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [splitSelectedId, setSplitSelectedId] = useState<number>(1);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [introCompany, setIntroCompany] = useState<any>(null);

  const executeSearch = (query: string) => {
    setSearchTerm(query);
    setActiveSearch(query);

    if (!query.trim()) {
      setIsSearching(false);
      setSearchState("none");
      setResults(allBusinesses);
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase();

    // 1. EXACT SEARCH
    const exactMatches = allBusinesses.filter(op =>
      (op.companyName || "").toLowerCase().includes(lowerQuery) ||
      (op.industry || "").toLowerCase().includes(lowerQuery) ||
      (op.needs || []).some((n: string) => n.toLowerCase().includes(lowerQuery)) ||
      (op.offerings || []).some((o: string) => o.toLowerCase().includes(lowerQuery)) ||
      (op.location || "").toLowerCase().includes(lowerQuery)
    );

    let exactResults = [...exactMatches];
    if (lowerQuery.includes("need clients") || lowerQuery.includes("looking for clients")) {
      const clientSeekers = allBusinesses.filter(op => (op.needs || []).some((n: string) => n.toLowerCase().includes("agency") || n.toLowerCase().includes("vendor")));
      exactResults = [...new Set([...exactResults, ...clientSeekers])];
    }

    if (exactResults.length > 0) {
      setResults(exactResults);
      setSearchState("exact");
      if (exactResults.length > 0) setSplitSelectedId(exactResults[0].id);
      return;
    }

    // 2. RELATED SEARCH
    let relatedKeywords: string[] = [];
    for (const [key, related] of Object.entries(INTENT_MAP)) {
      if (lowerQuery.includes(key)) {
        relatedKeywords = [...relatedKeywords, ...related];
      }
    }

    if (relatedKeywords.length > 0) {
      const relatedMatches = allBusinesses.filter(op =>
        relatedKeywords.some(kw =>
          (op.industry || "").toLowerCase().includes(kw) ||
          (op.needs || []).some((n: string) => n.toLowerCase().includes(kw)) ||
          (op.offerings || []).some((o: string) => o.toLowerCase().includes(kw))
        )
      );

      if (relatedMatches.length > 0) {
        setResults([...new Set(relatedMatches)]);
        setSearchState("related");
        if (relatedMatches.length > 0) setSplitSelectedId(relatedMatches[0].id);
        return;
      }
    }

    // 3. EMPTY STATE
    setResults([]);
    setSearchState("empty");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch(searchTerm);
    }
  };

  const toggleSave = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter(savedId => savedId !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  // VIEWS
  const renderFeedView = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      {isLoading ? (
        <div className="py-20 text-center"><p className="text-slate-500 font-bold">Loading businesses...</p></div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center"><p className="text-slate-500 font-bold">No businesses found.</p></div>
      ) : results.map(op => (
        <div
          key={op.id}
          onClick={() => setSelectedMatch(op)}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-blue-300 dark:hover:border-blue-800 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center cursor-pointer shadow-sm hover:shadow-md"
        >
          {/* Logo & Identity */}
          <div className="flex items-center gap-4 w-full md:w-[320px] shrink-0">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-xl text-slate-400 shrink-0">
              {op.companyName[0]}
            </div>
            <div className="min-w-0 flex-grow">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Link href={`/business/${op.id}`} onClick={(e) => e.stopPropagation()}>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white truncate hover:text-blue-600 transition-colors">{op.companyName}</h4>
                </Link>
                {op.verified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase flex flex-wrap items-center gap-x-2 gap-y-1 leading-normal">
                <span className="flex items-center gap-1 shrink-0"><Briefcase className="h-3 w-3" /> {op.industry}</span>
                <span className="text-slate-300 dark:text-white/10">•</span>
                <span className="flex items-center gap-1 shrink-0"><MapPin className="h-3 w-3" /> {op.location || `${op.city}, ${op.state}`}</span>
              </div>
            </div>
          </div>

          {/* Need Statement */}
          <div className="flex-grow min-w-0 py-2 md:py-0 md:px-4 md:border-l md:border-r border-slate-100 dark:border-white/5">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic line-clamp-2">
              "{op.goal}"
            </p>
            {(op.budget || op.city || op.urgency === 'High' || op.postedTime) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {op.budget && (
                  <span className="text-emerald-600 dark:text-emerald-500">{op.budget}</span>
                )}
                {op.budget && op.city && <span className="hidden sm:inline">•</span>}
                {op.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {op.city}
                  </span>
                )}
                {op.urgency === 'High' && (
                  <>
                    {(op.budget || op.city) && <span className="hidden sm:inline">•</span>}
                    <span className="text-rose-500">Urgent</span>
                  </>
                )}
                {op.postedTime && (
                  <>
                    {(op.budget || op.city || op.urgency === 'High') && <span className="hidden sm:inline">•</span>}
                    <span>{op.postedTime}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIntroCompany({ id: op.id, name: op.companyName, industry: op.industry, verified: op.verified });
                setIsIntroModalOpen(true);
              }}
              className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-slate-900 text-white hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 transition-colors shadow-md"
            >
              Request Intro
            </Button>
            <Button
              variant="outline"
              className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors hidden sm:flex"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMatch(op);
              }}
            >
              View
            </Button>
          </div>
        </div>
      ))}
      {results.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Opportunities Found"
          description="Try adjusting your search terms or filters to discover new strategic matches."
        />
      )}
    </div>
  );

  const renderSplitView = () => {
    const selectedItem = results.find(d => d.id === splitSelectedId) || results[0];

    if (results.length === 0) {
      return (
        <div className="p-12 text-center text-slate-500 font-bold border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
          No opportunities found.
        </div>
      )
    }

    return (
      <div className="flex gap-6 flex-grow min-h-0 h-full animate-in fade-in duration-300">
        {/* Left List Column */}
        <div className="w-[420px] shrink-0 flex flex-col min-h-0 h-full gap-4">
          
          {/* Compact Search inside Left List */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-11 pr-20 h-11 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 font-bold text-sm w-full focus:ring-2 ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm text-slate-900 dark:text-white"
              />
              <Button
                onClick={() => executeSearch(searchTerm)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-slate-900 hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[9px] shadow-sm transition-colors"
              >
                Search
              </Button>
            </div>
            {isSearching && (
              <Button 
                variant="ghost" 
                onClick={() => { setIsSearching(false); setSearchState("none"); setSearchTerm(""); setResults(allBusinesses); }} 
                className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 h-11 px-3 border border-slate-200 dark:border-white/10 rounded-xl flex-shrink-0"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Scrollable Left List Cards */}
          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-2 min-h-0">
            {results.map(op => (
              <div
                key={op.id}
                onClick={() => setSplitSelectedId(op.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedItem?.id === op.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-900 bg-white dark:bg-[#0A0A0A]'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-xs text-slate-400 shrink-0">
                      {op.companyName[0]}
                    </div>
                    <Link href={`/business/${op.id}`} onClick={(e) => e.stopPropagation()}>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm italic hover:text-blue-600 transition-colors">{op.companyName}</h4>
                    </Link>
                    {op.verified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">"{op.goal}"</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border-none font-black text-[9px] uppercase tracking-widest">{op.industry}</Badge>
                  {op.postedTime && <span className="text-[9px] font-black uppercase text-slate-400">{op.postedTime}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Preview */}
        <div className="flex-grow bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-sm h-full">
          {selectedItem && (() => {
            const initials = (selectedItem.companyName || selectedItem.userName || "U").substring(0, 2).toUpperCase()
            return (
              <div className="flex flex-col h-full">
                {/* Header Card (Logo, Company Name, Industry, Location, Team Size, Verification) */}
                <div className="p-4 md:p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 relative flex-shrink-0">

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left mt-1">
                    {/* Logo initials container */}
                    <div className={`h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${getGradientClass(selectedItem.companyName || selectedItem.userName || "")} flex items-center justify-center text-white font-black text-lg md:text-xl tracking-tight shadow-md flex-shrink-0`}>
                      {initials}
                    </div>

                    <div className="space-y-1 flex-grow pr-8">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center sm:justify-start">
                        <h2 className="text-lg md:text-xl font-black italic tracking-tight text-slate-900 dark:text-white leading-tight">
                          {selectedItem.companyName}
                        </h2>
                        <div className="flex justify-center sm:justify-start">
                          {renderVerificationBadge(selectedItem.verified, selectedItem.verificationStatus)}
                        </div>
                      </div>

                      {/* Metadata details (Industry, Location, Employees) */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-white/40">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-primary" />
                          <span>{selectedItem.industry || "Not Specified"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          <span>{selectedItem.city ? `${selectedItem.city}, ${selectedItem.state}` : (selectedItem.location || "Global")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-emerald-500" />
                          <span>{selectedItem.team || selectedItem.teamSize || "1-5"} Employees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-grow custom-scrollbar">
                  
                  {/* Middle Card: Goal / Intent / Looking For */}
                  <div className="space-y-1.5">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-primary" /> Current Goal & Focus
                    </h3>
                    <div className="p-3.5 rounded-xl border-l-2 border-primary bg-primary/[0.02] dark:bg-primary/[0.04] relative overflow-hidden">
                      <p className="text-xs font-semibold leading-relaxed italic text-slate-700 dark:text-slate-300">
                        "{selectedItem.goal || 'Looking for B2B strategic alliances and reciprocal deals.'}"
                      </p>
                    </div>
                  </div>

                  {/* Bottom Card: Offerings & Needs */}
                  <div className="space-y-3 pt-2.5 border-t border-slate-100 dark:border-white/5">
                    
                    {/* Offerings list */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-emerald-500" /> Services & Offerings
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.offerings || selectedItem.offers ? (
                          (selectedItem.offerings || selectedItem.offers || []).map((off: string) => (
                            <Badge 
                              key={off} 
                              variant="outline" 
                              className="text-[8px] font-black tracking-wider bg-slate-50 border-slate-200 hover:border-primary/40 dark:bg-white/5 dark:border-white/10 dark:text-white/80 dark:hover:border-primary/40 px-2 py-0.5 rounded-lg transition-all"
                            >
                              {off}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">None declared</span>
                        )}
                      </div>
                    </div>

                    {/* Needs list */}
                    <div className="space-y-1 pt-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-blue-500" /> Looking For / Needs
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.needs ? (
                          (selectedItem.needs || []).map((need: string) => (
                            <Badge 
                              key={need} 
                              variant="outline" 
                              className="text-[8px] font-black tracking-wider bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 px-2 py-0.5 rounded-lg transition-all"
                            >
                              {need}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">None declared</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 md:p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex gap-3 flex-shrink-0">
                  <Button
                    onClick={() => {
                      setIntroCompany({ id: selectedItem.id, name: selectedItem.companyName, industry: selectedItem.industry, verified: selectedItem.verified });
                      setIsIntroModalOpen(true);
                    }}
                    className="w-full h-10 md:h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" /> Request Intro
                  </Button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    );
  };

  const renderTableView = () => (
    <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden overflow-x-auto shadow-sm animate-in fade-in duration-300">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <th className="p-4 pl-6">Company</th>
            <th className="p-4">Industry</th>
            <th className="p-4">Primary Need</th>
            <th className="p-4">Budget</th>
            <th className="p-4">Location</th>
            <th className="p-4">Posted</th>
            <th className="p-4 text-right pr-6">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {results.map(op => (
            <tr key={op.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedMatch(op)}>
              <td className="p-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-slate-500">{op.companyName[0]}</div>
                  <div>
                    <Link href={`/business/${op.id}`}>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <span>
                          {op.companyName}
                          {op.verified && <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/10" />}
                        </span>
                      </h3>
                    </Link>
                  </div>
                </div>
              </td>
              <td className="p-4"><Badge className="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 border-none font-black text-[9px] uppercase tracking-widest">{op.industry}</Badge></td>
              <td className="p-4 max-w-[250px]"><p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{op.goal}</p></td>
              <td className="p-4 font-black text-sm text-slate-900 dark:text-white">{op.budget || "Flexible"}</td>
              <td className="p-4 text-xs font-bold text-slate-500 flex items-center gap-1.5">
                {(op.city || op.location) ? (
                  <>
                    <MapPin className="h-3 w-3 mr-1" /> {op.city || op.location}
                  </>
                ) : (
                  "Global"
                )}
              </td>
              <td className="p-4 text-xs font-bold text-slate-400">{op.postedTime || "Recent"}</td>
              <td className="p-4 text-right pr-6">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIntroCompany({ id: op.id, name: op.companyName, industry: op.industry, verified: op.verified });
                    setIsIntroModalOpen(true);
                  }}
                  variant="ghost"
                  className="h-8 px-4 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Request Intro
                </Button>
              </td>
            </tr>
          ))}
          {results.length === 0 && (
            <tr>
              <td colSpan={7} className="p-12 text-center text-slate-500 font-bold">No opportunities found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`max-w-[1500px] mx-auto px-4 md:px-8 ${viewMode === 'split' ? 'h-[calc(100vh-96px)] md:h-[calc(100vh-112px)] lg:h-[calc(100vh-128px)] flex flex-col overflow-hidden space-y-3' : 'space-y-8 pb-32'}`}>

      {viewMode === 'split' ? (
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">
              Explore Opportunities
            </h1>
          </div>
          {/* View Toggles for Split View */}
          <div className="flex items-center bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode("feed")}
              className="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Feed View"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("split")}
              className="p-2 rounded-lg transition-all bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm"
              title="Split View"
            >
              <LayoutPanelLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Table View"
            >
              <TableProperties className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Page Title Header */}
          <div className="pb-6 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight italic mb-2">
              Explore Opportunities
            </h1>
            <p className="text-slate-500 dark:text-white/40 font-bold text-sm tracking-wide">
              Search and connect with potential B2B partners across the network.
            </p>
          </div>

          {/* 🧭 NEW TOP LAYOUT: SEARCH & FILTERS */}
          <div className="pt-6 pb-4 border-b border-slate-200 dark:border-white/10 space-y-5 flex-shrink-0">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              {/* Large Search Bar */}
              <div className="relative flex-grow">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                <Input
                  placeholder="Search companies, needs, industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-16 pr-32 h-16 rounded-[2rem] bg-white dark:bg-[#0A0A0A] border-2 border-slate-200 dark:border-white/10 font-bold text-lg focus:ring-4 ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm text-slate-900 dark:text-white"
                />
                <Button
                  onClick={() => executeSearch(searchTerm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-8 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-md transition-colors"
                >
                  Search
                </Button>
              </div>

              {/* View Toggles (Desktop only) */}
              <div className="hidden lg:flex items-center bg-white dark:bg-[#0A0A0A] border-2 border-slate-200 dark:border-white/10 rounded-[1.5rem] p-1.5 shadow-sm shrink-0">
                <button
                  onClick={() => setViewMode("feed")}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'feed' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  title="Feed View"
                >
                  <LayoutList className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className="p-3 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Split View"
                >
                  <LayoutPanelLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  title="Table View"
                >
                  <TableProperties className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
              <Button onClick={() => alert('Advanced filters modal opening soon!')} variant="outline" className="rounded-full shrink-0 border-slate-200 dark:border-white/10 h-10 px-5 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 bg-white dark:bg-[#0A0A0A]">
                <Filter className="h-3.5 w-3.5 mr-2" /> All Filters
              </Button>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 shrink-0"></div>
              {["Verified", "High Budget", "Nearby", "Newest", "Active", "Tech", "Manufacturing"].map(f => (
                <Badge key={f} className="cursor-pointer shrink-0 bg-white dark:bg-[#0A0A0A] hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-4 py-2.5 font-black text-[10px] uppercase tracking-widest rounded-full transition-colors shadow-sm">
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* --- BEFORE SEARCH --- */}
      {!isSearching && (
        <div className={`animate-in fade-in duration-500 pt-4 min-h-0 ${viewMode === 'split' ? 'flex-grow flex flex-col space-y-4' : 'space-y-12'}`}>
          {viewMode !== 'split' && (
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mr-2">
                <TrendingUp className="h-4 w-4 text-blue-500" /> Suggested Searches
              </span>
              {SUGGESTED_SEARCHES.map(s => (
                <Badge
                  key={s}
                  onClick={() => executeSearch(s)}
                  className="cursor-pointer bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-full transition-colors"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <div className={`min-h-0 ${viewMode === 'split' ? 'flex-grow flex flex-col space-y-4' : 'space-y-6'}`}>
            {viewMode !== 'split' && (
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 flex-shrink-0">
                <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                  <Clock className="h-6 w-6 text-slate-400" /> Live Opportunity Feed
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{results.length} active</span>
              </div>
            )}
            {/* Force mobile to use feed view */}
            <div className="block lg:hidden">{renderFeedView()}</div>
            <div className={`hidden lg:block min-h-0 ${viewMode === 'split' ? 'flex-grow flex flex-col' : ''}`}>
              {viewMode === 'feed' && renderFeedView()}
              {viewMode === 'split' && renderSplitView()}
              {viewMode === 'table' && renderTableView()}
            </div>
          </div>
        </div>
      )}

      {/* --- AFTER SEARCH --- */}
      {isSearching && (
        <div className={`animate-in fade-in duration-500 pt-4 min-h-0 ${viewMode === 'split' ? 'flex-grow flex flex-col space-y-4' : 'space-y-6'}`}>
          {viewMode !== 'split' && (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 flex-shrink-0">
              <h2 className="text-xl font-black italic tracking-tight text-slate-900 dark:text-white">
                Results for "{activeSearch}"
              </h2>
              <Button variant="ghost" onClick={() => { setIsSearching(false); setSearchState("none"); setSearchTerm(""); setResults(allBusinesses); }} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 h-8 px-3">
                Clear Search
              </Button>
            </div>
          )}

          <div className="block lg:hidden">
            {searchState !== 'empty' && renderFeedView()}
          </div>
          <div className={`hidden lg:block min-h-0 ${viewMode === 'split' ? 'flex-grow flex flex-col' : ''}`}>
            {searchState !== 'empty' && viewMode === 'feed' && renderFeedView()}
            {searchState !== 'empty' && viewMode === 'split' && renderSplitView()}
            {searchState !== 'empty' && viewMode === 'table' && renderTableView()}
          </div>

          {searchState === 'related' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-6 flex items-start gap-4 mb-8 mt-6 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-black text-base text-blue-900 dark:text-blue-300 italic tracking-tight">Taplyzer AI Assisted Search</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-1">We couldn't find an exact match for "{activeSearch}", so we translated your search into related market opportunities.</p>
              </div>
            </div>
          )}

          {searchState === "empty" && (
            <div className="space-y-12 mt-6">
              <div className="bg-slate-900 dark:bg-[#0A0A0A] border border-slate-800 dark:border-white/10 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Sparkles className="h-48 w-48 text-blue-500" /></div>

                <div className="h-20 w-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 relative z-10">
                  <Sparkles className="h-10 w-10 text-blue-400" />
                </div>

                <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                  <h3 className="text-2xl lg:text-3xl font-black italic tracking-tighter text-white">No Exact Matches Found</h3>
                  <p className="text-slate-400 font-bold text-sm lg:text-lg leading-relaxed">
                    We couldn't find a direct match for "{activeSearch}". However, Taplyzer's AI can analyze your requirements and alert you the moment a matching business joins the platform.
                  </p>
                </div>

                <div className="bg-slate-800/50 dark:bg-white/5 border border-slate-700 dark:border-white/10 rounded-2xl lg:rounded-3xl p-5 lg:p-8 max-w-2xl mx-auto relative z-10 shadow-inner">
                  <h4 className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-400" /> AI Assistant Alert Prompt
                  </h4>
                  <textarea
                    placeholder="Describe exactly what you're looking for (e.g., 'I need a logistics partner in Mumbai with a budget of $50k')..."
                    className="w-full h-32 bg-slate-900/50 dark:bg-[#0A0A0A] border border-slate-700 dark:border-white/10 rounded-2xl p-4 lg:p-5 text-white placeholder-slate-600 focus:ring-2 ring-blue-500 focus:border-blue-500 resize-none font-bold shadow-inner"
                  ></textarea>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => alert('AI Alert created! We will notify you when matches are found.')} className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all">
                      Set AI Alert
                    </Button>
                  </div>
                </div>

                <div className="relative z-10 border-t border-slate-800 pt-8 mt-8 flex flex-wrap justify-center gap-3">
                  <span className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Or try these general searches</span>
                  {SUGGESTED_SEARCHES.slice(0, 6).map((s, i) => (
                    <Badge key={i} onClick={() => executeSearch(s)} className="cursor-pointer bg-slate-800 hover:bg-blue-900/40 text-slate-300 hover:text-blue-300 border border-slate-700 px-5 py-2.5 font-black text-[10px] uppercase tracking-widest rounded-full transition-all shadow-sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📧 VIEW PROFILE MODAL (Used mainly for Feed and Table views) */}
      {/* 📧 VIEW PROFILE MODAL (Used mainly for Feed and Table views) */}
      {selectedMatch && (
        <ViewProfileModal
          open={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          match={{
            matchedUserId: (selectedMatch.ownerId || selectedMatch.id || selectedMatch._id || "").toString(),
            candidateName: selectedMatch.userName || selectedMatch.ownerName || selectedMatch.companyName || "Unknown",
            companyName: selectedMatch.companyName || "",
            industry: selectedMatch.industry || "",
            location: selectedMatch.location || (selectedMatch.city ? `${selectedMatch.city}${selectedMatch.state ? ", " + selectedMatch.state : ""}` : selectedMatch.country || "Remote"),
            score: selectedMatch.score || 0,
            offerings: selectedMatch.offerings || selectedMatch.offers || [],
            needs: selectedMatch.needs || [],
            goal: selectedMatch.goal || selectedMatch.tagline || "",
            offeringGoal: selectedMatch.offeringGoal || selectedMatch.tagline || "",
            reasons: selectedMatch.reasons || [],
            verified: selectedMatch.verified || false,
            verificationStatus: selectedMatch.verificationStatus || selectedMatch.trust?.verificationStatus || (selectedMatch.verified ? "Business Verified" : "Not Verified"),
            teamSize: selectedMatch.teamSize || selectedMatch.team || selectedMatch.strength?.teamSize || "1-5"
          }}
          onRequestIntro={() => {
            setIntroCompany({ 
              id: selectedMatch.ownerId || selectedMatch.id || selectedMatch._id, 
              name: selectedMatch.companyName, 
              industry: selectedMatch.industry, 
              verified: selectedMatch.verified 
            });
            setIsIntroModalOpen(true);
            setSelectedMatch(null);
          }}
        />
      )}

      {introCompany && (
        <RequestIntroModal
          open={isIntroModalOpen}
          onClose={() => setIsIntroModalOpen(false)}
          company={introCompany}
        />
      )}
    </div>
  )
}
