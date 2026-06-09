"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    
    // Configs
    const particleCount = 115
    const connectionDistance = 125
    const mouseRadius = 175
    const gravityForce = 0.09

    const colors = [
      "rgba(6, 182, 212, 0.65)",  // Cyan
      "rgba(16, 185, 129, 0.55)", // Emerald
      "rgba(59, 130, 246, 0.55)",  // Blue
    ]

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const w = canvas.width
      const h = canvas.height
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null }
    }

    // Set initial size and resize listener
    handleResize()
    window.addEventListener("resize", handleResize)
    canvas.parentElement?.addEventListener("mousemove", handleMouseMove)
    canvas.parentElement?.addEventListener("mouseleave", handleMouseLeave)

    // Animation Loop
    const draw = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const w = canvas.width
      const h = canvas.height
      const mouse = mouseRef.current

      // Update and draw particles
      particles.forEach((p) => {
        // Apply mouse gravity/repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouseRadius) {
            // Pull gently toward mouse
            const force = (mouseRadius - dist) / mouseRadius
            p.vx += (dx / dist) * force * gravityForce * 0.2
            p.vy += (dy / dist) * force * gravityForce * 0.2
          }
        }

        // Limit speed
        const speedLimit = 1.2
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (currentSpeed > speedLimit) {
          p.vx = (p.vx / currentSpeed) * speedLimit
          p.vy = (p.vy / currentSpeed) * speedLimit
        }

        // Move
        p.x += p.vx
        p.y += p.vy

        // Boundary bounce / wrap with padding
        const padding = 20
        if (p.x < -padding) p.x = w + padding
        if (p.x > w + padding) p.x = -padding
        if (p.y < -padding) p.y = h + padding
        if (p.y > h + padding) p.y = -padding

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 4
        ctx.shadowColor = p.color
        ctx.fill()
      })

      // Reset shadow for performance
      ctx.shadowBlur = 0

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.28
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(103, 232, 249, ${opacity})` // Cyan glow line
            ctx.lineWidth = 0.95
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.parentElement?.removeEventListener("mousemove", handleMouseMove)
      canvas.parentElement?.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
