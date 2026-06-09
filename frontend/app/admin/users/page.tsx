"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Search, UserX, ShieldCheck, MoreVertical, ChevronLeft, ChevronRight, UserPlus, UserCheck, Trash2, ShieldPlus, ShieldMinus, AlertTriangle } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard, SkeletonRow } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { useAuth } from "@/components/auth-provider"

interface User {
  _id: string; name: string; email: string; role: string; status: string
  verified: boolean; createdAt: string; designation?: string; company?: string; isFlagged?: boolean
}

export default function AdminUsersPage() {
  const { user: currentUser, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  // Confirm-delete dialog
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; email: string } | null>(null)
  const [deleteReason, setDeleteReason] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      if (roleFilter) params.set("role", roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
      setStats(data.stats)
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, statusFilter, roleFilter])

  useEffect(() => { fetchData() }, [fetchData])

  async function doAction(userId: string, action: string) {
    setActionLoading(userId + action)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, adminId: currentUser?._id }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Action failed")
        return
      }
      setActiveMenu(null)
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  async function doDelete() {
    if (!deleteTarget) return
    setActionLoading(deleteTarget.id + "delete")
    try {
      const adminId = currentUser?._id || ""
      const params = new URLSearchParams({
        userId: deleteTarget.id,
        adminId,
        reason: deleteReason || "Deleted by super admin",
      })
      const res = await fetch(`/api/admin/users?${params}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Delete failed")
        return
      }
      setDeleteTarget(null)
      setDeleteReason("")
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    ADMIN: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    USER: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/40",
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Users"
        subtitle="Complete user lifecycle management — search, filter, act."
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats?.total ?? "—", color: "text-blue-500" },
          { label: "Active", value: stats?.active ?? "—", color: "text-emerald-500" },
          { label: "Suspended", value: stats?.suspended ?? "—", color: "text-red-500" },
          { label: "New Today", value: stats?.newToday ?? "—", color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email, company…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </select>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30">
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                {["User", "Role", "Status", "Verified", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/25">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : users.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Users} title="No users found" description="Try adjusting your filters." /></td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                          <span className="text-red-500 font-black text-xs">
                            {u.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-white/30">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${roleColors[u.role] || roleColors.USER}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status?.toLowerCase() || "active"} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      {u.verified
                        ? <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"><ShieldCheck className="h-3 w-3" /> Yes</span>
                        : <span className="text-[11px] font-bold text-slate-400 dark:text-white/25">No</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-white/25">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3">
                      {u.email !== currentUser?.email && (
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === u._id ? null : u._id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </button>
                          {activeMenu === u._id && (
                            <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-1 w-52">
                              {/* ── Verification ── */}
                              {!u.verified ? (
                                <button onClick={() => doAction(u._id, "verify")} disabled={!!actionLoading}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                                  <UserCheck className="h-3.5 w-3.5" /> Verify Business
                                </button>
                              ) : (
                                <button onClick={() => doAction(u._id, "unverify")} disabled={!!actionLoading}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                  <ShieldCheck className="h-3.5 w-3.5" /> Revoke Verification
                                </button>
                              )}

                              {/* ── Suspend / Reactivate ── */}
                              {u.status === "ACTIVE" || u.status === "BANNED" ? (
                                <button onClick={() => doAction(u._id, "suspend")} disabled={!!actionLoading}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                  <UserX className="h-3.5 w-3.5" /> Suspend
                                </button>
                              ) : (
                                <button onClick={() => doAction(u._id, "unsuspend")} disabled={!!actionLoading}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                                  <UserCheck className="h-3.5 w-3.5" /> Reactivate
                                </button>
                              )}

                              {/* ── Super Admin only actions ── */}
                              {isSuperAdmin && (
                                <>
                                  <div className="my-1 border-t border-slate-100 dark:border-white/5" />
                                  {/* Ban */}
                                  <button onClick={() => doAction(u._id, "ban")} disabled={!!actionLoading}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
                                    <UserX className="h-3.5 w-3.5" /> Ban Account
                                  </button>

                                  {/* Make / Remove Admin */}
                                  {u.role === "USER" ? (
                                    <button onClick={() => doAction(u._id, "make_admin")} disabled={!!actionLoading}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                      <ShieldPlus className="h-3.5 w-3.5" /> Make Admin
                                    </button>
                                  ) : u.role === "ADMIN" ? (
                                    <button onClick={() => doAction(u._id, "remove_admin")} disabled={!!actionLoading}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                      <ShieldMinus className="h-3.5 w-3.5" /> Remove Admin
                                    </button>
                                  ) : null}

                                  {/* Delete */}
                                  <div className="my-1 border-t border-slate-100 dark:border-white/5" />
                                  <button
                                    onClick={() => { setDeleteTarget({ id: u._id, name: u.name, email: u.email }); setActiveMenu(null) }}
                                    disabled={!!actionLoading}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" /> Delete Account
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/5">
            <p className="text-xs font-bold text-slate-400 dark:text-white/25">Page {page} of {pages} ({total} users)</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5">
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5">
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111] border border-red-200 dark:border-red-900/40 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Delete Account Permanently?</p>
                <p className="text-xs text-slate-500 dark:text-white/40">This action cannot be undone.</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-xs font-black text-slate-700 dark:text-white/70">{deleteTarget.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-white/30">{deleteTarget.email}</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/40">
              This will permanently delete the user account <strong>and their business profile</strong>. All associated data will be removed.
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
                {actionLoading ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
