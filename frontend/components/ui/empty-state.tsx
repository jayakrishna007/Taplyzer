"use client"

import { LucideIcon, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-300 dark:text-white/10">
        <Icon className="h-12 w-12" />
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">{title}</h3>
        <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{description}</p>
      </div>

      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={onAction}
              className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
