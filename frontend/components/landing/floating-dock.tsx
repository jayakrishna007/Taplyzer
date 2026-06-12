"use client"

import { useState } from "react"
import { Home, LayoutGrid, Workflow, Sparkles } from "lucide-react"

interface DockItem {
  label: string
  targetId: string
  icon: React.ComponentType<{ className?: string }>
}

export function FloatingDock() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null)
  const [clickTimeoutId, setClickTimeoutId] = useState<any>(null)

  const items: DockItem[] = [
    { label: "Home", targetId: "home", icon: Home },
    { label: "Features", targetId: "features", icon: LayoutGrid },
    { label: "How It Works", targetId: "how-it-works", icon: Workflow },
    { label: "Get Started", targetId: "cta-buttons", icon: Sparkles },
  ]

  const handleScroll = (targetId: string) => {
    let actualTargetId = targetId
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024
    if (targetId === "cta-buttons" && isDesktop) {
      actualTargetId = "cta-card"
    }
    const element = document.getElementById(actualTargetId)
    if (element) {
      if (isDesktop) {
        if (actualTargetId === "features" || actualTargetId === "how-it-works" || actualTargetId === "cta-card") {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        } else {
          element.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        if (actualTargetId === "cta-buttons") {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        } else {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      {/* Frosted glass container */}
      <div className="flex items-center gap-4.5 px-6 py-3 rounded-full bg-[#0a0a0f]/75 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/20">
        
        {items.map((item, idx) => {
          const Icon = item.icon
          
          // Calculate macOS Zoom Scale factor dynamically
          let scale = 1.0
          if (hoveredIndex !== null) {
            const dist = Math.abs(idx - hoveredIndex)
            if (dist === 0) scale = 1.35
            else if (dist === 1) scale = 1.15
          }

          const isTooltipVisible = activeTooltipIndex === idx

          return (
            <button
              key={item.label}
              onClick={() => {
                handleScroll(item.targetId)
                if (clickTimeoutId) {
                  clearTimeout(clickTimeoutId)
                }
                setActiveTooltipIndex(idx)
                const tId = setTimeout(() => {
                  setActiveTooltipIndex(null)
                }, 1000)
                setClickTimeoutId(tId)
              }}
              onMouseEnter={() => {
                setHoveredIndex(idx)
                setActiveTooltipIndex(idx)
              }}
              onMouseLeave={() => {
                setHoveredIndex(null)
                setActiveTooltipIndex(null)
                if (clickTimeoutId) {
                  clearTimeout(clickTimeoutId)
                  setClickTimeoutId(null)
                }
              }}
              className="relative p-2.5 rounded-full bg-white/[0.03] border border-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer focus:outline-none flex items-center justify-center"
              style={{
                transform: `scale(${scale})`,
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s, border-color 0.2s",
              }}
            >
              <Icon className="h-5 w-5" />

              {/* Tooltip Tag */}
              <div
                className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-[#050508]/95 border border-white/10 text-white text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-md transition-all duration-200 pointer-events-none ${
                  isTooltipVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-1.5 scale-95"
                }`}
              >
                {item.label}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#050508] border-t-white/10 -mt-[1px]" />
              </div>
            </button>
          )
        })}

      </div>
    </div>
  )
}
