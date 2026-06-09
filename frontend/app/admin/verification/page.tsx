"use client"

import { useEffect, useState, useCallback } from "react"
import { ShieldCheck, Search, Globe, Check, X, Clock, AlertCircle, ChevronLeft, ChevronRight, Trash2, AlertTriangle, PauseCircle, PlayCircle } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { useAuth } from "@/components/auth-provider"

interface Business {
  _id: string
  companyName?: string
  brandName?: string
  industry?: string
  trust?: {
    website?: string
    linkedin?: string
    gst?: string
    verificationStatus?: string
  }
  status?: string
  createdAt: string
  ownerId?: { name: string; email: string; status: string }
  strength?: { teamSize?: string }
  location?: { city?: string }
  adminNotes?: string
  profileScore?: number
}

const VERIFICATION_TIERS = [
  { label: "Not Verified", value: "Not Verified", color: "text-slate-500 bg-slate-100 dark:bg-white/5" },
  { label: "Basic Verified", value: "Basic Verified", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20" },
  { label: "Business Verified", value: "Business Verified", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20" },
  { label: "Trusted Partner", value: "Trusted Partner", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20" },
]

const statusTabs = [
  { label: "All", value: "" },
  { label: "Not Verified", value: "Not Verified" },
  { label: "Basic", value: "Basic Verified" },
  { label: "Business", value: "Business Verified" },
  { label: "Trusted", value: "Trusted Partner" },
]

export default function AdminVerificationPage() {
  const { user, isSuperAdmin } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteReason, setDeleteReason] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (statusFilter) params.set("status", statusFilter)
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/verification?${params}`)
      const data = await res.json()
      setBusinesses(data.businesses || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, statusFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  const adminId = user?._id || (user as any)?.id || ""

  // Set verification tier
  async function setVerification(businessId: string, verificationStatus: string) {
    setActionLoading(businessId + verificationStatus)
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          action: "set_verification",
          verificationStatus,
          adminNotes: noteMap[businessId] || "",
          adminId,
        }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Failed"); return }
      setExpandedId(null)
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  // Suspend or reinstate
  async function actBusiness(businessId: string, action: "suspend_business" | "reinstate_business") {
    setActionLoading(businessId + action)
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, action, reason: noteMap[businessId] || "", adminId }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Failed"); return }
      setExpandedId(null)
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  // Delete business profile
  async function doDelete() {
    if (!deleteTarget) return
    setActionLoading(deleteTarget.id + "delete")
    try {
      const params = new URLSearchParams({
        businessId: deleteTarget.id,
        adminId,
        reason: deleteReason || "Deleted by super admin",
      })
      const res = await fetch(`/api/admin/verification?${params}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Delete failed"); return }
      setDeleteTarget(null)
      setDeleteReason("")
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  const getVerificationTier = (b: Business) => b.trust?.verificationStatus || "Not Verified"
  const bizName = (b: Business) => b.brandName || b.companyName || "—"
  const isSuspended = (b: Business) => b.status === "SUSPENDED"

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Business Verification" subtitle="Trust & authenticity layer — set verification tiers and manage business profiles." />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Not Verified", value: stats?.notVerified ?? "—", color: "text-slate-500" },
          { label: "Basic Verified", value: stats?.basicVerified ?? "—", color: "text-blue-500" },
          { label: "Business Verified", value: stats?.businessVerified ?? "—", color: "text-emerald-500" },
          { label: "Trusted Partner", value: stats?.trustedPartner ?? "—", color: "text-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-white/5 p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search business, industry…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statusTabs.map((t) => (
            <button key={t.value} onClick={() => { setStatusFilter(t.value); setPage(1) }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${statusFilter === t.value ? "bg-red-600 text-white" : "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50 hover:border-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-6 animate-pulse">
              <div className="h-5 w-48 bg-slate-100 dark:bg-white/5 rounded mb-3" />
              <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded" />
            </div>
          ))
        ) : businesses.length === 0 ? (
          <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5">
            <EmptyState icon={ShieldCheck} title="Queue is empty" description="No businesses match the current filter." />
          </div>
        ) : (
          businesses.map((biz) => {
            const tier = getVerificationTier(biz)
            const tierConfig = VERIFICATION_TIERS.find((t) => t.value === tier)
            const expanded = expandedId === biz._id
            const suspended = isSuspended(biz)

            return (
              <div key={biz._id} className={`bg-white dark:bg-[#0A0A0A] rounded-2xl border transition-all overflow-hidden ${expanded ? "border-red-300 dark:border-red-900/50" : suspended ? "border-amber-300 dark:border-amber-900/40" : "border-slate-200 dark:border-white/5"}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">{bizName(biz)}</h3>
                        {/* Verification tier badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tierConfig?.color || ""}`}>
                          {tier}
                        </span>
                        {suspended && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                            SUSPENDED
                          </span>
                        )}
                        {biz.industry && <span className="text-[10px] font-bold text-slate-400 dark:text-white/30">{biz.industry}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-white/40">
                        {biz.ownerId?.email && <span>👤 {biz.ownerId.name} ({biz.ownerId.email})</span>}
                        {biz.location?.city && <span>📍 {biz.location.city}</span>}
                        {biz.strength?.teamSize && <span>👥 {biz.strength.teamSize}</span>}
                        {biz.trust?.gst && <span>🏢 GST: {biz.trust.gst}</span>}
                      </div>
                      <div className="flex gap-3 mt-2">
                        {biz.trust?.website && (
                          <a href={biz.trust.website.startsWith("http") ? biz.trust.website : `https://${biz.trust.website}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            <Globe className="h-3 w-3" /> Website
                          </a>
                        )}
                        {biz.trust?.linkedin && (
                          <a href={biz.trust.linkedin} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            LinkedIn
                          </a>
                        )}
                      </div>
                      {biz.adminNotes && (
                        <p className="mt-2 text-[11px] text-slate-400 dark:text-white/25 italic">Note: {biz.adminNotes}</p>
                      )}
                    </div>

                    {/* Right action buttons */}
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {/* Suspend / Reinstate */}
                      {!suspended ? (
                        <button onClick={() => actBusiness(biz._id, "suspend_business")} disabled={!!actionLoading}
                          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black rounded-xl bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors disabled:opacity-50">
                          <PauseCircle className="h-3.5 w-3.5" /> Suspend
                        </button>
                      ) : (
                        <button onClick={() => actBusiness(biz._id, "reinstate_business")} disabled={!!actionLoading}
                          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
                          <PlayCircle className="h-3.5 w-3.5" /> Reinstate
                        </button>
                      )}
                      {/* Expand to set verification tier */}
                      <button onClick={() => setExpandedId(expanded ? null : biz._id)}
                        className="px-3 py-1.5 text-[11px] font-black rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        {expanded ? "Cancel" : "Set Tier"}
                      </button>
                      {/* Delete — super admin only */}
                      {isSuperAdmin && (
                        <button onClick={() => setDeleteTarget({ id: biz._id, name: bizName(biz) })}
                          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verification Tier Panel */}
                  {expanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Set Verification Tier</p>
                      <textarea
                        value={noteMap[biz._id] || ""}
                        onChange={(e) => setNoteMap((m) => ({ ...m, [biz._id]: e.target.value }))}
                        placeholder="Admin note (internal only, optional)…"
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {VERIFICATION_TIERS.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setVerification(biz._id, t.value)}
                            disabled={!!actionLoading || tier === t.value}
                            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-colors disabled:opacity-50 ${tier === t.value ? "ring-2 ring-offset-1 ring-red-500 " : ""}${t.color}`}
                          >
                            {tier === t.value && <Check className="h-3 w-3 inline mr-1" />}
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 dark:text-white/25">Page {page} of {pages} ({total} total)</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Business Modal ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111] border border-red-200 dark:border-red-900/40 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Delete Business Profile?</p>
                <p className="text-xs text-slate-500 dark:text-white/40">This action cannot be undone.</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-xs font-black text-slate-700 dark:text-white/70">{deleteTarget.name}</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/40">
              The business profile will be permanently deleted and the owner's verification status will be revoked.
            </p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Reason for deletion (optional, logged for audit)…"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteReason("") }}
                className="px-4 py-2 text-xs font-black rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                disabled={!!actionLoading}
                className="px-4 py-2 text-xs font-black rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {actionLoading ? "Deleting…" : "Delete Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
