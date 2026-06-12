"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MatchCard, type Match } from "@/components/dashboard/match-card"
import { Search, Bell, Users, RefreshCw } from "lucide-react"
import { RequestIntroModal } from "@/components/modals/request-intro-modal"
import { ViewProfileModal } from "@/components/modals/view-profile-modal"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function MatchesPage() {
  const [search, setSearch] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [viewProfileMatch, setViewProfileMatch] = useState<Match | null>(null)
  const [industryFilter, setIndustryFilter] = useState("ALL")
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const [cacheAgeMinutes, setCacheAgeMinutes] = useState<number | null>(null)

  const { user } = useAuth()
  const router = useRouter()
  const [showRefreshWarning, setShowRefreshWarning] = useState(false)

  // ── GET-first strategy: instant load from cache, fall back to engine run ──
  const fetchMatches = useCallback(async (forceRefresh = false) => {
    if (!user?._id) return

    if (forceRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      if (!forceRefresh) {
        // Try cache first (GET) — instant, no AI cost
        const cacheRes = await fetch(`/api/matches/${user._id}`, { method: "GET" })
        const cacheData = await cacheRes.json()

        if (cacheData.matches && cacheData.matches.length > 0 && !cacheData.meta?.isStale) {
          // Deduplicate stale DB data by matchedUserId
          const seen = new Set<string>();
          const deduped = cacheData.matches.filter((m: any) => {
            const id = (m.matchedUserId ?? m._id ?? "").toString();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          setAllMatches(deduped)
          setFromCache(true)
          setCacheAgeMinutes(cacheData.meta?.cacheAgeMinutes ?? null)
          setIsLoading(false)
          return
        }
      }

      // Cache miss or force refresh — run the full engine (POST)
      const freshRes = await fetch(`/api/matches/${user._id}`, { method: "POST" })
      const freshData = await freshRes.json()

      if (freshData.matches) {
        // Deduplicate by matchedUserId in case of any residual duplicates
        const seen = new Set<string>();
        const deduped = freshData.matches.filter((m: any) => {
          const id = (m.matchedUserId ?? m._id ?? "").toString();
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setAllMatches(deduped)
        setFromCache(false)
        setCacheAgeMinutes(0)
        if (forceRefresh) {
          window.location.reload()
        }
      }
    } catch (err) {
      console.error("Failed to fetch matches", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchMatches(false)
  }, [fetchMatches])

  const filteredMatches = allMatches.filter(match => {
    const name = match.companyName || match.candidateName || ""
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      (match.industry || "").toLowerCase().includes(search.toLowerCase())
    const matchesIndustry =
      industryFilter === "ALL" ||
      (match.industry || "").toUpperCase() === industryFilter
    return matchesSearch && matchesIndustry
  })

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Finding your best matches…
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight italic mb-1">
              Matches
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-slate-500 dark:text-white/40 font-medium text-xs uppercase tracking-widest font-black">
                Businesses matched to your intent profile
              </p>
              {fromCache && cacheAgeMinutes !== null && (
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  ⚡ Cached · {cacheAgeMinutes < 1 ? "just now" : `${cacheAgeMinutes}m ago`}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button — forces a fresh engine run */}
            <button
              onClick={() => setShowRefreshWarning(true)}
              disabled={isRefreshing}
              title="Refresh matches"
              className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <button className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all flex-shrink-0">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Left-aligned Search Bar that fits perfectly for mobile */}
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search matches..."
              className="pl-11 h-11 bg-slate-100 dark:bg-white/5 border-none rounded-2xl font-bold text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
        <div />
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          {filteredMatches.length} Companies Found
        </div>
      </div>

      {/* Grid of Results */}
      {filteredMatches.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {filteredMatches.map((match, idx) => (
            <MatchCard
              key={`${match.matchedUserId?.toString() ?? "match"}-${idx}`}
              match={match}
              onRequestIntro={() => {
                setSelectedCompany({
                  id: match.matchedUserId,
                  name: match.companyName || match.candidateName,
                  industry: match.industry,
                  verified: match.verified,
                  matchScore: match.score,
                })
                setIsModalOpen(true)
              }}
              onViewProfile={(m) => {
                setViewProfileMatch(m)
                setIsProfileOpen(true)
              }}
            />
          ))}
        </div>
      ) : allMatches.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Matches Available"
          description="We couldn't find any matches based on your current intent profile. Try updating your profile offerings, needs, or goal to get matches."
          actionLabel="Update Profile"
          onAction={() => {
            router.push("/profile")
          }}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No Matches Found"
          description="No matches fit your search query. Try clearing the search filter."
          actionLabel="Clear Search"
          onAction={() => {
            setSearch("")
          }}
        />
      )}

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
            })
            setIsModalOpen(true)
          }}
        />
      )}

      <Dialog open={showRefreshWarning} onOpenChange={setShowRefreshWarning}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 gap-6 border-none shadow-2xl bg-white dark:bg-[#0A0A0A]">
          <DialogTitle className="text-xl font-black italic text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            ⚠️ Refresh Warning
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 dark:text-white/60 leading-relaxed">
            Warning: By refreshing the page, the content profiles and matches may change. Do you wish to proceed?
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
                fetchMatches(true);
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
