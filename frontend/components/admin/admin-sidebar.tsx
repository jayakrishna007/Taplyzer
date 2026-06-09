"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Cpu, Users, ShieldCheck, Target, Star, Flag,
  Handshake, MessageSquare, Calendar, Search, Sparkles,
  CreditCard, Bell, HeadphonesIcon, Image, BarChart3,
  Settings, Shield, ScrollText, ChevronLeft, ChevronRight,
  LogOut, ShieldAlert, Brain, ChevronDown
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { adminModules, ModuleStatus } from "@/config/adminModules"
import { ModuleStatusBadge } from "@/components/admin/ModulePlaceholder"

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  moduleKey: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, moduleKey: "dashboard" },
      { name: "Network Ops Center", href: "/admin/noc", icon: Cpu, moduleKey: "noc" },
    ],
  },
  {
    label: "User Management",
    items: [
      { name: "Users", href: "/admin/users", icon: Users, moduleKey: "users" },
      { name: "Business Verification", href: "/admin/verification", icon: ShieldCheck, moduleKey: "verification" },
      { name: "Profiles & Intent", href: "/admin/profiles", icon: Target, moduleKey: "profilesIntent" },
      { name: "Ratings & Feedback", href: "/admin/ratings", icon: Star, moduleKey: "ratings" },
      { name: "Reports & Flags", href: "/admin/flags", icon: Flag, moduleKey: "reportsFlags" },
    ],
  },
  {
    label: "Network & Matching",
    items: [
      { name: "Matches", href: "/admin/matches", icon: Handshake, moduleKey: "matches" },
      { name: "Requests", href: "/admin/requests", icon: MessageSquare, moduleKey: "requests" },
      { name: "Meetings", href: "/admin/meetings", icon: Calendar, moduleKey: "meetings" },
      { name: "Explore Monitoring", href: "/admin/explore-monitoring", icon: Search, moduleKey: "exploreMonitoring" },
      { name: "AI Match Insights", href: "/admin/ai-insights", icon: Sparkles, moduleKey: "aiInsights" },
    ],
  },
  {
    label: "Business Operations",
    items: [
      { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, moduleKey: "subscriptions" },
      { name: "Notifications", href: "/admin/notifications", icon: Bell, moduleKey: "notifications" },
      { name: "Support & Tickets", href: "/admin/support", icon: HeadphonesIcon, moduleKey: "supportTickets" },
      { name: "Content & Banners", href: "/admin/content", icon: Image, moduleKey: "contentBanners" },
    ],
  },
  {
    label: "System Control",
    items: [
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3, moduleKey: "analytics" },
      { name: "Gemini Usage", href: "/admin/gemini-usage", icon: Brain, moduleKey: "geminiUsage" },
      { name: "System Settings", href: "/admin/settings", icon: Settings, moduleKey: "systemSettings" },
      { name: "Admins & Roles", href: "/admin/admins", icon: Shield, moduleKey: "adminsRoles" },
      { name: "Activity Logs", href: "/admin/activity-logs", icon: ScrollText, moduleKey: "activityLogs" },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { logOut, user, isSuperAdmin } = useAuth()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Overview": true,
    "User Management": true,
    "Network & Matching": true,
    "Business Operations": true,
    "System Control": true,
  })

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  const shouldShowItem = (item: NavItem): boolean => {
    const mod = adminModules[item.moduleKey]
    if (!mod) return false
    if (!mod.visible) return false
    if (mod.status === "disabled") return false
    // Internal modules only visible to super admins
    if (mod.status === "internal" && !isSuperAdmin) return false
    return true
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-[#030303] border-r border-slate-200 dark:border-white/5 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Logo ── */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 shrink-0">
        <Link href="/" className={cn("flex items-center gap-2.5", collapsed && "justify-center w-full")}>
          <div className="h-8 w-8 rounded-lg bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center justify-center shrink-0">
            <ShieldAlert className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-black tracking-tight text-slate-900 dark:text-white text-sm block leading-none">
                TapAdmin
              </span>
              <span className="text-[8px] font-black text-red-500/70 uppercase tracking-widest">
                Intent OS
              </span>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-1">
          {!collapsed && <ModeToggle />}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/40 rounded-lg",
              collapsed && "absolute -right-3.5 top-[18px] bg-white dark:bg-[#030303] border border-slate-200 dark:border-white/10 rounded-full h-7 w-7 shadow-sm"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(shouldShowItem)
          if (visibleItems.length === 0) return null
          const isExpanded = expandedGroups[group.label] !== false
          return (
            <div key={group.label} className="space-y-1.5">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white px-3 transition-colors group/btn"
                >
                  <span>{group.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200 text-slate-400 dark:text-white/10 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white", !isExpanded && "-rotate-90")} />
                </button>
              )}
              {(isExpanded || collapsed) && (
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const mod = adminModules[item.moduleKey]
                    const status = mod?.status as ModuleStatus
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all",
                          active
                            ? "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.2)]"
                            : "text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1">{item.name}</span>
                            {!active && <ModuleStatusBadge status={status} />}
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-2 py-3 border-t border-slate-100 dark:border-white/5 space-y-0.5 shrink-0">
        {user?.email === "admin@taplyser.com" && (
          <Link
            href="/dashboard"
            title={collapsed ? "User Mode" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>User Mode</span>}
          </Link>
        )}
        <button
          onClick={logOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* ── Admin Profile ── */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-red-600/15 border border-red-600/20 flex items-center justify-center shrink-0">
              <span className="text-red-500 font-black text-xs">
                {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "SA"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-none">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-0.5">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
