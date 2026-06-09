"use client"

import { useEffect, useRef, useState, ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  animation?: "slide-up" | "slide-down" | "slide-left" | "slide-right" | "fade" | "scale"
  duration?: number
  delay?: number
}

export function ScrollReveal({
  children,
  animation = "slide-up",
  duration = 800,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
        } else {
          setIsIntersecting(false)
        }
      },
      {
        threshold: 0.1, // Trigger as soon as 10% is visible
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const getAnimationClass = () => {
    if (isIntersecting) {
      return "opacity-100 translate-x-0 translate-y-0 scale-100"
    }

    switch (animation) {
      case "slide-up":
        return "opacity-0 translate-y-12"
      case "slide-down":
        return "opacity-0 -translate-y-12"
      case "slide-left":
        return "opacity-0 translate-x-12"
      case "slide-right":
        return "opacity-0 -translate-x-12"
      case "scale":
        return "opacity-0 scale-95"
      case "fade":
      default:
        return "opacity-0"
    }
  }

  return (
    <div
      ref={ref}
      className="transition-all ease-out"
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={`${getAnimationClass()} transition-all duration-inherit delay-inherit ease-inherit`}>
        {children}
      </div>
    </div>
  )
}
