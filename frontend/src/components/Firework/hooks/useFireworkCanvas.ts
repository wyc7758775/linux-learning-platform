import { useEffect, type MutableRefObject, type RefObject } from 'react'
import { GRAVITY, MAX_PARTICLES } from '../constants'
import { createParticle } from '../utils/createParticle'
import type { Particle } from '../types'

interface UseFireworkCanvasOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>
  particlesRef: MutableRefObject<Particle[]>
  animationRef: MutableRefObject<number>
  timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  duration: number
  onComplete?: () => void
  playSound: () => void
  stopAllAudio: () => void
}

export function useFireworkCanvas({
  canvasRef,
  particlesRef,
  animationRef,
  timeoutRef,
  duration,
  onComplete,
  playSound,
  stopAllAudio,
}: UseFireworkCanvasOptions) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const explode = (x: number, y: number) => {
      const particleCount = Math.min(30, MAX_PARTICLES - particlesRef.current.length)
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(x, y))
      }
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    playSound()
    explode(canvas.width / 2, canvas.height / 2)

    const explosionInterval = setInterval(() => {
      const x = Math.random() * canvas.width * 0.6 + canvas.width * 0.2
      const y = Math.random() * canvas.height * 0.4 + canvas.height * 0.2
      explode(x, y)
      playSound()
    }, 800)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.vy += GRAVITY
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= particle.decay
        particle.alpha = particle.life

        if (particle.life <= 0) {
          return false
        }

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.alpha
        ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const cleanup = () => {
      window.removeEventListener('resize', resizeCanvas)
      clearInterval(explosionInterval)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      particlesRef.current = []
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stopAllAudio()
    }

    timeoutRef.current = setTimeout(() => {
      cleanup()
      onComplete?.()
    }, duration)

    return cleanup
  }, [
    animationRef,
    canvasRef,
    duration,
    onComplete,
    particlesRef,
    playSound,
    stopAllAudio,
    timeoutRef,
  ])
}
