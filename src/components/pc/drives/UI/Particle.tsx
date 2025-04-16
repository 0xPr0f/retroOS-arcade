import React, { useEffect, useRef, useMemo, useCallback } from 'react'

interface ParticleProps {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  friction: number
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<ParticleProps[]>([])
  const animationFrameIdRef = useRef<number>(0)

  // Memoize particle class to avoid recreating on each render
  const Particle = useMemo(() => {
    return class Particle implements ParticleProps {
      x: number
      y: number
      size: number
      vx: number
      vy: number
      friction: number
      baseSpeed: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.size = Math.random() * 2 + 1 // Smaller particles for better performance
        this.baseSpeed = 1.5 // Slightly reduced base speed
        const angle = Math.random() * Math.PI * 2
        this.vx = Math.cos(angle) * this.baseSpeed
        this.vy = Math.sin(angle) * this.baseSpeed
        this.friction = 0.98 // Slightly more friction for smoother motion
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }

      update(canvas: HTMLCanvasElement, mouseX: number, mouseY: number) {
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.hypot(dx, dy) // More efficient than Math.sqrt

        if (distance < 40) {
          // Reduced repulsion radius
          const angle = Math.atan2(dy, dx)
          this.vx = -Math.cos(angle) * this.baseSpeed * 1.5
          this.vy = -Math.sin(angle) * this.baseSpeed * 1.5
        } else if (Math.random() < 0.005) {
          // Reduced random motion frequency
          const newAngle = Math.random() * Math.PI * 2
          this.vx = Math.cos(newAngle) * this.baseSpeed
          this.vy = Math.sin(newAngle) * this.baseSpeed
        }

        this.x += this.vx
        this.y += this.vy

        // Optimized screen wrapping
        const dpr = window.devicePixelRatio || 1
        const width = canvas.width / dpr
        const height = canvas.height / dpr

        this.x = (this.x + width) % width
        this.y = (this.y + height) % height
      }
    }
  }, [])

  const setCanvasSize = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    },
    []
  )

  const initParticles = useCallback(
    (canvas: HTMLCanvasElement) => {
      const dpr = window.devicePixelRatio || 1
      const numberOfParticles = Math.min((canvas.width * canvas.height) / 3000) // Cap max particles
      particlesRef.current = Array.from({ length: numberOfParticles }, () => {
        const x = (Math.random() * canvas.width) / dpr
        const y = (Math.random() * canvas.height) / dpr
        return new Particle(x, y)
      })
    },
    [Particle]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false }) // Disable alpha for better performance
    if (!ctx) return

    setCanvasSize(canvas, ctx)
    initParticles(canvas)

    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, '#dc2626')
      gradient.addColorStop(1, '#2563eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Batch particle rendering
      ctx.shadowBlur = 10 // Reduced blur for performance
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'

      const dpr = window.devicePixelRatio || 1
      particlesRef.current.forEach((particle) => {
        if ('update' in particle && 'draw' in particle) {
          ;(particle as any).update(
            canvas,
            mouseRef.current.x,
            mouseRef.current.y
          )
          ;(particle as any).draw(ctx)
        }
      })

      animationFrameIdRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleResize = () => {
      setCanvasSize(canvas, ctx)
      initParticles(canvas)
    }

    animate()
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [setCanvasSize, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ touchAction: 'none' }}
    />
  )
}

export default React.memo(ParticleBackground)
