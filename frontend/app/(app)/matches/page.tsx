"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MatchCard, type Match } from "@/components/dashboard/match-card"
import { Search, Bell, Users, RefreshCw } from "lucide-react"
import { RequestIntroModal } from "@/components/modals/request-intro-modal"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

export default function MatchesPage() {
  const [search, setSearch] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [industryFilter, setIndustryFilter] = useState("ALL")
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const [cacheAgeMinutes, setCacheAgeMinutes] = useState<number | null>(null)

  const { user } = useAuth()

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic mb-1">
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search matches..."
              className="pl-11 h-11 bg-slate-100 dark:bg-white/5 border-none rounded-2xl font-bold text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Refresh button — forces a fresh engine run */}
          <button
            onClick={() => fetchMatches(true)}
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIndustryFilter("ALL")}
            className={`h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
              industryFilter === "ALL"
                ? "border-primary text-primary bg-primary/5"
                : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary/50"
            }`}
          >
            All Industries
          </button>
        </div>

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
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Matches Found"
          description="Try adjusting your filters or update your profile offerings & needs to improve match quality."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("")
            setIndustryFilter("ALL")
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
    </div>
  )
}
