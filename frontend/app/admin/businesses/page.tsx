"use client"

import { useAdminStore } from "@/lib/admin-store"
import {
  Building2,
  Search,
  Trash2,
  BadgeCheck,
  MoreHorizontal,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  DollarSign,
  Clock
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function BusinessManagement() {
  const {
    businesses,
    approveBusiness,
    rejectBusiness,
    verifyBusiness,
    suspendBusiness,
    activateBusiness,
    deleteBusiness
  } = useAdminStore()

  const [searchTerm, setSearchTerm] = useState("")

  const filteredBusinesses = businesses.filter((b) =>
    b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="h-3 w-3 text-emerald-500" />
      case "REJECTED": return <XCircle className="h-3 w-3 text-red-500" />
      case "SUSPENDED": return <AlertCircle className="h-3 w-3 text-orange-500" />
      default: return <Clock className="h-3 w-3 text-slate-400" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Business Management</h1>
          <p className="text-slate-500 dark:text-white/40 font-medium mt-1">Monitor and verify business profiles on the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Value</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Created</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredBusinesses.map((biz) => (
                <tr key={biz.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{biz.companyName}</p>
                          {biz.verified && (
                            <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30 font-medium capitalize">
                          {biz.industry} • <MapPin className="h-3 w-3" /> {typeof biz.location === 'string' ? biz.location : `${(biz.location as any)?.city || ''}${(biz.location as any)?.city && (biz.location as any)?.country ? ', ' : ''}${(biz.location as any)?.country || ''}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-white font-bold tracking-tight">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {biz.ownerName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      <DollarSign className="h-3 w-3" />
                      {biz.dealValue}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(biz.status)}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${biz.status === "APPROVED"
                          ? "text-emerald-600"
                          : biz.status === "PENDING"
                            ? "text-slate-400"
                            : "text-red-600"
                        }`}>
                        {biz.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-white/40 font-bold uppercase tracking-tight">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {biz.createdAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-white/5">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#0F0F0F] border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-1">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Workflow Actions</DropdownMenuLabel>

                        {biz.status === "PENDING" && (
                          <DropdownMenuItem onClick={() => approveBusiness(biz.id)} className="gap-2 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-600">
                            <CheckCircle className="h-4 w-4" /> Approve Profile
                          </DropdownMenuItem>
                        )}

                        {!biz.verified && (
                          <DropdownMenuItem onClick={() => verifyBusiness(biz.id)} className="gap-2 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:bg-primary/10 focus:text-primary">
                            <BadgeCheck className="h-4 w-4" /> Verify & Approve
                          </DropdownMenuItem>
                        )}

                        {biz.status === "PENDING" && (
                          <DropdownMenuItem onClick={() => rejectBusiness(biz.id)} className="gap-2 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:bg-red-500/10 focus:text-red-600">
                            <XCircle className="h-4 w-4" /> Reject Profile
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-1" />
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Management</DropdownMenuLabel>

                        {biz.status !== "SUSPENDED" ? (
                          <DropdownMenuItem onClick={() => suspendBusiness(biz.id)} className="gap-2 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:bg-orange-500/10 focus:text-orange-600">
                            <AlertCircle className="h-4 w-4" /> Suspend Business
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => activateBusiness(biz.id)} className="gap-2 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-600">
                            <CheckCircle className="h-4 w-4" /> Reactivate Business
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => deleteBusiness(biz.id)} className="gap-2 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:bg-red-500/10 text-red-600 focus:text-red-500">
                          <Trash2 className="h-4 w-4" /> Delete Business
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBusinesses.length === 0 && (
          <div className="py-20 text-center">
            <Building2 className="h-12 w-12 text-slate-200 dark:text-white/5 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/40 font-bold">No businesses found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

