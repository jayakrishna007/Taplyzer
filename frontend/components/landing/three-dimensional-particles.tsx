"use client"

import { useEffect, useRef } from "react"

interface Node3D {
  x: number
  y: number
  z: number
  color: string
  size: number
  neighbors: number[]
}

interface Star3D {
  x: number
  y: number
  z: number
  size: number
  color: string
  speed: number
}

interface Packet3D {
  sourceIdx: number
  targetIdx: number
  progress: number
  speed: number
}

export function ThreeDimensionalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  
  const nodesRef = useRef<Node3D[]>([])
  const starsRef = useRef<Star3D[]>([])
  const packetsRef = useRef<Packet3D[]>([])

  const NODE_COUNT = 55
  const STAR_COUNT = 180
  const PACKET_COUNT = 12

  const colors = {
    cyan: "rgba(34, 211, 238, ",   // #22d3ee
    emerald: "rgba(16, 185, 129, ", // #10b981
    purple: "rgba(168, 85, 247, ",  // #a855f7
    white: "rgba(255, 255, 255, ",
    yellow: "rgba(251, 191, 36, ",  // #fbbf24
  }

  // Initialize nodes and connections
  const initSystem = () => {
    const nodes: Node3D[] = []
    const sphereRadius = 60

    // 1. Generate Nodes inside a 3D Sphere
    for (let i = 0; i < NODE_COUNT; i++) {
      // Fibonacci sphere lattice + some noise for beautiful distribution
      const k = i + 0.5
      const phi = Math.acos(1 - (2 * k) / NODE_COUNT)
      const theta = Math.PI * (1 + 5 ** 0.5) * k
      
      const r = sphereRadius // perfect spherical radius (like Earth)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      // Assign core brand colors
      const rand = Math.random()
      let color = colors.cyan
      if (rand > 0.65) color = colors.purple
      else if (rand > 0.35) color = colors.emerald

      nodes.push({
        x,
        y,
        z,
        color,
        size: Math.random() * 2.5 + 2.2, // node diameter size
        neighbors: []
      })
    }

    // 2. Establish Connections based on 3D distance
    const maxConnectionDist = 45
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < maxConnectionDist) {
          nodes[i].neighbors.push(j)
          nodes[j].neighbors.push(i)
        }
      }
    }

    // 3. Generate background stars
    const stars: Star3D[] = []
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      const r = sphereRadius * (1.5 + Math.random() * 2) // distant stars shell
      
      stars.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        size: Math.random() * 0.8 + 0.4,
        color: Math.random() > 0.5 ? colors.cyan : colors.white,
        speed: (Math.random() * 0.0005 + 0.0002) * (Math.random() > 0.5 ? 1 : -1)
      })
    }

    // 4. Spawn active data packets traveling along edges
    const packets: Packet3D[] = []
    for (let i = 0; i < PACKET_COUNT; i++) {
      // Find a node that has neighbors
      let sourceIdx = Math.floor(Math.random() * NODE_COUNT)
      while (nodes[sourceIdx].neighbors.length === 0) {
        sourceIdx = Math.floor(Math.random() * NODE_COUNT)
      }

      const neighbors = nodes[sourceIdx].neighbors
      const targetIdx = neighbors[Math.floor(Math.random() * neighbors.length)]

      packets.push({
        sourceIdx,
        targetIdx,
        progress: Math.random(),
        speed: Math.random() * 0.012 + 0.006
      })
    }

    nodesRef.current = nodes
    starsRef.current = stars
    packetsRef.current = packets
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let autoAngleY = 0

    const handleResize = () => {
      if (!canvas) return
      const scale = window.devicePixelRatio || 1
      const width = canvas.parentElement?.clientWidth || 450
      const height = canvas.parentElement?.clientHeight || 450
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Init systems
    initSystem()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      // Rotate by max 45 degrees based on mouse position
      mouseRef.current.targetX = (x / rect.width) * 0.6
      mouseRef.current.targetY = (y / rect.height) * 0.6
    }

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0
      mouseRef.current.targetY = 0
    }

    canvas.parentElement?.addEventListener("mousemove", handleMouseMove)
    canvas.parentElement?.addEventListener("mouseleave", handleMouseLeave)

    // Render loop
    const draw = () => {
      if (!canvas || !ctx) return
      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)

      ctx.clearRect(0, 0, width, height)

      // Auto rotation velocity
      autoAngleY += 0.002

      // Mouse drag rotation damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06

      const angleY = autoAngleY + mouseRef.current.x * Math.PI
      const angleX = mouseRef.current.y * Math.PI * 0.4

      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)

      const centerX = width / 2
      const centerY = height / 2
      const zoom = Math.min(width, height) * 0.0058

      const nodes = nodesRef.current
      const stars = starsRef.current
      const packets = packetsRef.current

      // 1. Rotate and Project background stars
      const projectedStars = stars.map((s) => {
        // Orbit rotation around local Y axis
        const xRot = s.x * Math.cos(s.speed) - s.z * Math.sin(s.speed)
        const zRot = s.x * Math.sin(s.speed) + s.z * Math.cos(s.speed)
        s.x = xRot
        s.z = zRot

        // Global mouse/auto rotations
        let rx1 = s.x * cosY - s.z * sinY
        let rz1 = s.x * sinY + s.z * cosY
        let ry2 = s.y * cosX - rz1 * sinX
        let rz2 = s.y * sinX + rz1 * cosX

        const d = 220
        const scale = d / (d + rz2)
        const sx = centerX + rx1 * scale * zoom
        const sy = centerY - ry2 * scale * zoom

        return { sx, sy, size: s.size * scale, color: s.color, depth: rz2 }
      })

      // 2. Rotate and Project matching nodes
      const projectedNodes = nodes.map((n) => {
        let rx1 = n.x * cosY - n.z * sinY
        let rz1 = n.x * sinY + n.z * cosY
        let ry2 = n.y * cosX - rz1 * sinX
        let rz2 = n.y * sinX + rz1 * cosX

        const d = 220
        const scale = d / (d + rz2)
        const sx = centerX + rx1 * scale * zoom
        const sy = centerY - ry2 * scale * zoom

        return { sx, sy, x3d: rx1, y3d: ry2, z3d: rz2, size: n.size * scale, color: n.color, depth: rz2 }
      })

      // 3. Draw Stars (Far depth)
      projectedStars.forEach((s) => {
        if (s.depth > 30) { // draw far stars
          ctx.beginPath()
          ctx.arc(s.sx, s.sy, s.size, 0, Math.PI * 2)
          ctx.fillStyle = `${s.color}0.25)`
          ctx.fill()
        }
      })

      // 4. Draw Connections (Lines)
      ctx.lineWidth = 0.95
      for (let i = 0; i < NODE_COUNT; i++) {
        const n1 = projectedNodes[i]
        nodes[i].neighbors.forEach((neighborIdx) => {
          if (neighborIdx > i) {
            const n2 = projectedNodes[neighborIdx]
            
            // Map depth opacity (closer lines are brighter, further lines are dim)
            const avgDepth = (n1.depth + n2.depth) / 2
            const depthFactor = (200 - avgDepth) / 300 // range 0 to 1
            const alpha = Math.max(0.02, Math.min(0.4, depthFactor * 0.35))

            ctx.beginPath()
            ctx.moveTo(n1.sx, n1.sy)
            ctx.lineTo(n2.sx, n2.sy)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.stroke()
          }
        })
      }

      // 5. Update and Draw Laser Packets
      packets.forEach((p) => {
        // Move along connection line
        p.progress += p.speed

        if (p.progress >= 1.0) {
          // Reached destination, pick a new connected neighbor
          p.progress = 0
          p.sourceIdx = p.targetIdx
          
          const neighbors = nodes[p.sourceIdx].neighbors
          if (neighbors.length > 0) {
            p.targetIdx = neighbors[Math.floor(Math.random() * neighbors.length)]
          }
        }

        const n1 = projectedNodes[p.sourceIdx]
        const n2 = projectedNodes[p.targetIdx]

        // Interpolate 2D projection
        const sx = n1.sx + (n2.sx - n1.sx) * p.progress
        const sy = n1.sy + (n2.sy - n1.sy) * p.progress
        const avgDepth = n1.depth + (n2.depth - n1.depth) * p.progress

        // Packet size scales with depth
        const scale = 220 / (220 + avgDepth)
        const size = (Math.random() * 2 + 3) * scale

        // Outer glow
        ctx.beginPath()
        ctx.arc(sx, sy, size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251, 191, 36, 0.15)`
        ctx.fill()

        // Inner core
        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251, 191, 36, 0.95)`
        ctx.fill()
      })

      // 6. Draw Nodes (Constellation joints)
      // Sort nodes back-to-front so closer ones paint on top of further ones
      const sortedNodes = [...projectedNodes].sort((a, b) => b.depth - a.depth)
      
      sortedNodes.forEach((n) => {
        // Calculate dynamic alpha based on depth
        const depthFactor = (200 - n.depth) / 300
        const alpha = Math.max(0.15, Math.min(0.9, depthFactor * 0.9))

        // Node Glow Ring
        ctx.beginPath()
        ctx.arc(n.sx, n.sy, n.size * 2.2, 0, Math.PI * 2)
        ctx.fillStyle = `${n.color}${alpha * 0.15})`
        ctx.fill()

        // Solid Inner Node Joint
        ctx.beginPath()
        ctx.arc(n.sx, n.sy, n.size, 0, Math.PI * 2)
        ctx.fillStyle = `${n.color}${alpha})`
        ctx.fill()
      })

      // 7. Draw Foreground Stars
      projectedStars.forEach((s) => {
        if (s.depth <= 30) { // draw near stars
          ctx.beginPath()
          ctx.arc(s.sx, s.sy, s.size, 0, Math.PI * 2)
          ctx.fillStyle = `${s.color}0.45)`
          ctx.fill()
        }
      })

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
      className="w-full h-full pointer-events-none z-20 block"
    />
  )
}
