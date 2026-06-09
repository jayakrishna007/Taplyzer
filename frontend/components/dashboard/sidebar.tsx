"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Send,
  Calendar,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matches", href: "/dashboard/matches", icon: Users },
  { name: "Requests", href: "/dashboard/requests", icon: Send },
  { name: "Meetings", href: "/dashboard/meetings", icon: Calendar },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

const bottomNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(true)
  const { logOut, user } = useAuth()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSetupComplete(localStorage.getItem("taplyzer_setup_complete") === "true")
    }
  }, [])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white/50 dark:bg-[#030303] border-r border-slate-200 dark:border-white/5 transition-all duration-300 backdrop-blur-xl",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-white/5">
          <Link href="/" className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
            <div className="h-8 w-8 rounded-lg bg-primary shadow-[0_0_15px_rgba(3,169,244,0.3)] flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            {!collapsed && <span className="font-bold text-slate-900 dark:text-white tracking-tight">Taplyzer</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 shrink-0", collapsed && "absolute -right-4 top-4 bg-sidebar border border-sidebar-border rounded-full")}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const isLocked = !isSetupComplete && item.name !== "Profile"

            return (
              <Link
                key={item.name}
                href={isLocked ? "/profile/setup" : item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-[0_0_15px_rgba(3,169,244,0.2)]"
                    : "text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                  collapsed && "justify-center",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom navigation */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                    : "text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
          <button
            onClick={(e) => {
              e.preventDefault()
              logOut()
            }}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>

        {/* User profile */}
        {!collapsed && (
          <div className="px-3 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'JD'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user?.name || 'John Doe'}</p>
                <p className="text-[10px] text-slate-400 dark:text-white/40 truncate font-bold uppercase tracking-widest">{user?.email || 'john@company.com'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
