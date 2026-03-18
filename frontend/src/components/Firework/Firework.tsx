import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  alpha: number
  size: number
  life: number
  decay: number
}

interface FireworkProps {
  onComplete?: () => void
  duration?: number
}

const MAX_PARTICLES = 100
const GRAVITY = 0.15
const COLORS = [
  '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3',
  '#f38181', '#aa96da', '#fcbad3', '#a8d8ea',
  '#ff9a9e', '#fad0c4', '#a1c4fd', '#c2e9fb'
]

export function Firework({ onComplete, duration = 3000 }: FireworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const createParticle = useCallback((x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 6 + 2
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
      size: Math.random() * 3 + 2,
      life: 1,
      decay: Math.random() * 0.015 + 0.01
    }
  }, [])

  const explode = useCallback((x: number, y: number) => {
    const particleCount = Math.min(30, MAX_PARTICLES - particlesRef.current.length)
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(x, y))
    }
  }, [createParticle])

  const playSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3)

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch {
      // 静默失败
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 播放音效
    playSound()

    // 初始爆炸 - 屏幕中央
    explode(canvas.width / 2, canvas.height / 2)

    // 后续随机爆炸
    const explosionInterval = setInterval(() => {
      const x = Math.random() * canvas.width * 0.6 + canvas.width * 0.2
      const y = Math.random() * canvas.height * 0.4 + canvas.height * 0.2
      explode(x, y)
      playSound()
    }, 800)

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter(p => {
        p.vy += GRAVITY
        p.x += p.vx
        p.y += p.vy
        p.life -= p.decay
        p.alpha = p.life

        if (p.life <= 0) return false

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1

        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    // 5秒后自动结束
    timeoutRef.current = setTimeout(() => {
      cleanup()
      onComplete?.()
    }, duration)

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
    }

    return cleanup
  }, [duration, explode, playSound, onComplete])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40"
      style={{ willChange: 'transform', pointerEvents: 'none' }}
    />
  )
}
