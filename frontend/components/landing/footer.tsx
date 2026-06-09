"use client"

import Link from "next/link"
import { Linkedin, Instagram, Twitter, Compass, Sparkles } from "lucide-react"

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Explore", href: "/explore" },
    { name: "Matches", href: "/matches" },
    { name: "Meetings", href: "/meetings" }
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" }
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Help Center", href: "/help" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" }
  ]
}

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 pt-20 pb-10 transition-colors">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          
          {/* Brand Panel */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Compass className="h-5.5 w-5.5 text-white animate-spin-slow" />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">Taplyzer</span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 max-w-xs mb-8 font-semibold text-sm leading-relaxed">
              Intent-Based Business Networking & Deal-Making Platform. Beyond static bios—matching partnerships through reciprocal alignment.
            </p>
            
            {/* Social Icons Vetted Column */}
            <div className="flex items-center gap-3">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all bg-white dark:bg-white/5"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-500/30 transition-all bg-white dark:bg-white/5"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noreferrer"
                className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400/30 transition-all bg-white dark:bg-white/5"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-600 dark:text-slate-450 hover:text-blue-500 transition-all text-sm font-bold">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-600 dark:text-slate-455 hover:text-blue-500 transition-all text-sm font-bold">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Resources</h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-600 dark:text-slate-455 hover:text-blue-500 transition-all text-sm font-bold">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Simulation Core signal */}
          <div className="hidden lg:block col-span-1 text-center bg-slate-100/50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded-3xl p-6">
            <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest block mb-2">MATCH ACCURACY</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-450 tracking-tight block">96%</span>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Optimal synergy
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Taplyzer Inc. All rights reserved.
            </p>
            <div className="hidden md:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-black text-slate-400 dark:text-white/30 tracking-widest uppercase">Engine online</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-xs font-bold text-slate-550 hover:text-blue-500">Privacy</Link>
            <Link href="/terms" className="text-xs font-bold text-slate-550 hover:text-blue-500">Terms</Link>
            <Link href="/cookie-policy" className="text-xs font-bold text-slate-550 hover:text-blue-500">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
