"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {description && (
          <p className="text-slate-500 dark:text-white/40 mt-1 font-medium">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/30 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search matches..."
            className="pl-9 w-72 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 rounded-xl focus-visible:ring-primary/30"
          />
        </div>
        <Button variant="outline" size="icon" className="relative h-11 w-11 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(3,169,244,0.6)]"></span>
        </Button>
      </div>
    </header>
  )
}
