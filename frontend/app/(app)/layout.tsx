"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, Users, MessageSquare, Calendar, Star, 
  UserCircle, LogOut, Zap, Menu, X, Settings, Sun, Moon,
  ShieldCheck
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { NotificationPanel } from "@/components/notifications/notification-panel"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matches", href: "/matches", icon: Users },
  { name: "Explore", href: "/explore", icon: Zap },
  { name: "Requests", href: "/requests", icon: MessageSquare },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "Ratings & Feedback", href: "/ratings", icon: Star },
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<string>("Not Verified")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user) return
    async function fetchStatus() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          const status = data.business?.trust?.verificationStatus || "Not Verified"
          setVerificationStatus(status)
        }
      } catch (err) {
        console.error("Failed to fetch verification status:", err)
      }
    }
    fetchStatus()
  }, [user, pathname])

  useEffect(() => {
    if (!user) return

    const isSetupComplete = localStorage.getItem("taplyzer_setup_complete") === "true"
    if (!isSetupComplete && pathname !== "/profile/setup") {
      router.push("/profile/setup")
    }
  }, [pathname, router, user])

  const isVerified = ["Business Verified", "Basic Verified", "Trusted Partner"].includes(verificationStatus)
  const isPending = verificationStatus === "Under Review"

  const statusText = isVerified ? "Verified" : isPending ? "Pending" : "Not Verified"
  const statusColorClass = isVerified ? "text-emerald-500" : isPending ? "text-amber-500" : "text-red-500"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-white/5 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(3,169,244,0.3)]">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white italic">Taplyzer</span>
            </Link>
            <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-grow px-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-white/20"}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User + Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-black text-primary flex-shrink-0">
                {user?.name?.[0] || "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-black text-sm text-slate-900 dark:text-white truncate">{user?.name || "User"}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{user?.email || "user@example.com"}</span>
              </div>
            </div>
            {user?.email === "admin@taplyser.com" && (
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 h-auto rounded-xl font-bold border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm mb-2 text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                Control Room
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={logOut}
              className="w-full flex items-center justify-start gap-3 px-4 py-3 h-auto rounded-xl font-bold text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-grow lg:ml-64 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="h-16 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 gap-3">
          <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 flex-shrink-0" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>



          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Status</span>
              <span className={`text-[10px] font-black uppercase tracking-wider ${statusColorClass}`}>{statusText}</span>
            </div>

            {user?.email === "admin@taplyser.com" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin")}
                className="flex items-center gap-1.5 h-9 rounded-xl font-black uppercase tracking-widest text-[9px] text-primary border-primary/20 hover:bg-primary/5 mr-1"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Control Room
              </Button>
            )}

            {/* Dark Mode */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              {mounted && (theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-500" />)}
            </button>

            {/* Notification Bell */}
            <NotificationPanel />


          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 flex-grow">
          {children}
        </div>
      </main>
    </div>
  )
}
