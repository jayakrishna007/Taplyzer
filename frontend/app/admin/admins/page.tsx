"use client"

import { useEffect, useState } from "react"
import { Shield, ShieldAlert, Key } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard } from "@/components/admin/SectionCard"
import { useAuth } from "@/components/auth-provider"

export default function AdminRolesPage() {
  const { user, isSuperAdmin } = useAuth()
  const [admins, setAdmins] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/admins")
      const data = await res.json()
      setAdmins(data.admins || [])
      setStats(data.stats)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const changeRole = async (targetAdminId: string, newRole: string) => {
    if (!isSuperAdmin) return alert("Only Super Admins can change roles.")
    if (!confirm(`Change role to ${newRole}?`)) return
    try {
      await fetch("/api/admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAdminId, newRole, adminId: user?._id }),
      })
      await fetchData()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Admins & Roles" subtitle="Manage dashboard access and privileges." />

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-blue-500">{stats?.totalAdmins ?? "—"}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Admins</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <Key className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-red-500">{stats?.superAdmins ?? "—"}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Super Admins</p>
          </div>
        </div>
      </div>

      <SectionCard title="Admin Accounts" noPadding>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-50 dark:bg-white/2 animate-pulse" />)
          ) : (
            admins.map((a) => (
              <div key={a._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <span className="font-black text-slate-500">{a.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {a.name} {a.role === "SUPER_ADMIN" && <ShieldAlert className="h-3 w-3 text-red-500" />}
                    </p>
                    <p className="text-[11px] text-slate-400">{a.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-white/70">{a.actionCount}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Active</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-white/70">
                      {a.lastAction ? new Date(a.lastAction).toLocaleDateString("en-IN") : "Never"}
                    </p>
                  </div>
                  
                  {isSuperAdmin && a._id !== user?._id ? (
                    <select
                      value={a.role}
                      onChange={(e) => changeRole(a._id, e.target.value)}
                      className="text-xs font-black px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A]"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="USER">Demote to User</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                      a.role === "SUPER_ADMIN" ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                    }`}>
                      {a.role.replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  )
}
