"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin, isLoading, isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/auth?mode=signin")
      } else if (!isAdmin) {
        router.push("/dashboard")
      }
    }
  }, [isLoading, isLoggedIn, isAdmin, router])

  if (isLoading || !isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-white transition-colors duration-500">
      <AdminSidebar />
      <main className="lg:pl-64 transition-all duration-300 min-h-screen">
        <div className="p-6 lg:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  )
}
