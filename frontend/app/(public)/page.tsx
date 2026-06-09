import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works-section"
import { CTA } from "@/components/landing/cta"
import { FloatingDock } from "@/components/landing/floating-dock"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050508] text-white">
      
      {/* SECTION 1 — HERO SLIDESHOW & 3D PARTICLES */}
      <Hero />
      
      {/* SECTION 2 — 6-GRID ADVANTAGES */}
      <Features />
      
      {/* SECTION 3 — 3-STEP PROCESS */}
      <HowItWorks />
      
      {/* SECTION 4 — NEON GLOW CTA */}
      <CTA />
      
      {/* FIXED MACOS DOCK WIDGET */}
      <FloatingDock />
      
    </main>
  )
}
