"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

const NAV_LINKS: any[] = []

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { isLoggedIn, isLoading, logOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#050508]/90 backdrop-blur-xl border-b border-white/[0.04] py-3.5"
            : "bg-transparent py-5 sm:py-6"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">

          {/* Custom Network Node Logo matching the reference image */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 z-50">
            <svg
              className="h-7 w-7 text-[#2dd4bf] group-hover:scale-105 transition-transform"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              filter="drop-shadow(0 0 10px rgba(45,212,191,0.4))"
            >
              {/* Central node */}
              <circle cx="50" cy="50" r="13" fill="currentColor" />
              {/* Branching connections */}
              <line x1="50" y1="50" x2="25" y2="30" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
              <line x1="50" y1="50" x2="75" y2="30" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
              <line x1="50" y1="50" x2="50" y2="80" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
              {/* Leaf nodes */}
              <circle cx="25" cy="30" r="8" fill="#10b981" />
              <circle cx="75" cy="30" r="8" fill="#10b981" />
              <circle cx="50" cy="80" r="8" fill="#10b981" />
            </svg>
            <span className="font-bold text-xl tracking-tight text-white">
              Taplyzer
            </span>
          </Link>

          {/* Desktop nav links - Matched exactly to the image's layout and capitalization */}
          <div className="hidden lg:flex lg:gap-x-7 xl:gap-x-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[14px] font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden lg:flex lg:items-center gap-5">
            {isLoading ? (
              <div className="h-9 w-24 bg-white/5 rounded-full animate-pulse" />
            ) : isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-[14px] font-semibold text-white/70 hover:text-white transition-colors cursor-pointer">
                  Dashboard
                </Link>
                <Button
                  onClick={() => logOut()}
                  variant="outline"
                  className="border-white/20 bg-transparent hover:bg-white/5 text-white font-semibold rounded-full px-5 h-9 transition-all text-xs tracking-wide cursor-pointer"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=signin" className="text-[14px] font-semibold text-white/70 hover:text-white transition-colors cursor-pointer">
                  Sign In
                </Link>
                <Link href="/auth?mode=signup">
                  <Button
                    className="bg-[#10b981] hover:bg-[#0d9668] text-white font-semibold rounded-full px-5.5 h-9.5 transition-all text-xs tracking-wide cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

        </nav>
      </header>

      {/* Mobile menu — full screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 right-0 bottom-0 w-[min(320px,90vw)] bg-[#050508] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <svg
                  className="h-6 w-6 text-[#2dd4bf]"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="13" fill="currentColor" />
                  <line x1="50" y1="50" x2="25" y2="30" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                  <line x1="50" y1="50" x2="75" y2="30" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                  <line x1="50" y1="50" x2="50" y2="80" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                  <circle cx="25" cy="30" r="8" fill="#10b981" />
                  <circle cx="75" cy="30" r="8" fill="#10b981" />
                  <circle cx="50" cy="80" r="8" fill="#10b981" />
                </svg>
                <span className="font-bold text-lg text-white">Taplyzer</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:border-cyan-500/30 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium text-white/70 hover:bg-white/[0.03] hover:text-white transition-all"
                >
                  <span>{link.name}</span>
                  {link.hasDropdown && <ChevronDown className="h-4 w-4 text-white/30" />}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Actions */}
            <div className="px-6 py-6 border-t border-white/[0.05] space-y-4">
              {isLoading ? (
                <div className="h-11 w-full bg-white/5 rounded-full animate-pulse" />
              ) : isLoggedIn ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block">
                    <Button className="w-full h-11 rounded-full font-semibold bg-[#10b981] hover:bg-[#0d9668] text-white transition-all text-xs cursor-pointer">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => { logOut(); setMobileOpen(false); }}
                    className="w-full h-11 rounded-full font-semibold bg-transparent border border-white/20 hover:bg-white/5 text-white transition-all text-xs cursor-pointer"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth?mode=signin" onClick={() => setMobileOpen(false)} className="block text-center py-2 text-white/70 hover:text-white text-[14px] font-semibold transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)} className="block">
                    <Button className="w-full h-11 rounded-full font-semibold bg-[#10b981] hover:bg-[#0d9668] text-white transition-all text-xs cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      Sign Up Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

