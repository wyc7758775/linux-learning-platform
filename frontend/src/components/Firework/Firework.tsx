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
  const activeSourcesRef = useRef<AudioScheduledSourceNode[]>([])
  const activeNodesRef = useRef<AudioNode[]>([])

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

  const stopAllAudio = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop()
      } catch {
        // Ignore sources that already ended
      }

      try {
        source.disconnect()
      } catch {
        // Ignore disconnect failures during teardown
      }
    }

    for (const node of activeNodesRef.current) {
      try {
        node.disconnect()
      } catch {
        // Ignore disconnect failures during teardown
      }
    }

    activeSourcesRef.current = []
    activeNodesRef.current = []

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close().catch(() => {
        // 静默失败
      })
    }
    audioContextRef.current = null
  }, [])

  const playSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => {
          // 静默失败
        })
      }

      const now = ctx.currentTime

      const registerSource = <T extends AudioScheduledSourceNode>(source: T) => {
        activeSourcesRef.current.push(source)
        return source
      }

      const registerNode = <T extends AudioNode>(node: T) => {
        activeNodesRef.current.push(node)
        return node
      }

      const boomOscillator = registerSource(ctx.createOscillator())
      const boomGain = registerNode(ctx.createGain())
      boomOscillator.type = 'triangle'
      boomOscillator.frequency.setValueAtTime(180, now)
      boomOscillator.frequency.exponentialRampToValueAtTime(48, now + 0.35)
      boomGain.gain.setValueAtTime(0.001, now)
      boomGain.gain.exponentialRampToValueAtTime(0.22, now + 0.015)
      boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
      boomOscillator.connect(boomGain)
      boomGain.connect(ctx.destination)
      boomOscillator.start(now)
      boomOscillator.stop(now + 0.35)

      const crackleBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate)
      const crackleData = crackleBuffer.getChannelData(0)
      for (let i = 0; i < crackleData.length; i++) {
        const decay = 1 - i / crackleData.length
        crackleData[i] = (Math.random() * 2 - 1) * decay
      }

      const crackleSource = registerSource(ctx.createBufferSource())
      const crackleFilter = registerNode(ctx.createBiquadFilter())
      const crackleGain = registerNode(ctx.createGain())
      crackleSource.buffer = crackleBuffer
      crackleFilter.type = 'highpass'
      crackleFilter.frequency.setValueAtTime(900, now)
      crackleGain.gain.setValueAtTime(0.16, now + 0.01)
      crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
      crackleSource.connect(crackleFilter)
      crackleFilter.connect(crackleGain)
      crackleGain.connect(ctx.destination)
      crackleSource.start(now + 0.015)
      crackleSource.stop(now + 0.22)

      for (let i = 0; i < 2; i++) {
        const sparkleStart = now + 0.03 + i * 0.03
        const sparkleOscillator = registerSource(ctx.createOscillator())
        const sparkleGain = registerNode(ctx.createGain())

        sparkleOscillator.type = 'sine'
        sparkleOscillator.frequency.setValueAtTime(1600 + i * 300, sparkleStart)
        sparkleOscillator.frequency.exponentialRampToValueAtTime(520, sparkleStart + 0.14)
        sparkleGain.gain.setValueAtTime(0.001, sparkleStart)
        sparkleGain.gain.exponentialRampToValueAtTime(0.055, sparkleStart + 0.01)
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, sparkleStart + 0.14)

        sparkleOscillator.connect(sparkleGain)
        sparkleGain.connect(ctx.destination)
        sparkleOscillator.start(sparkleStart)
        sparkleOscillator.stop(sparkleStart + 0.14)
      }
    } catch {
      // 静默失败
    }
  }, [stopAllAudio])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let cleanedUp = false

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

    const cleanup = () => {
      if (cleanedUp) return
      cleanedUp = true
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
  }, [duration, explode, playSound, onComplete, stopAllAudio])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40"
      style={{ willChange: 'transform', pointerEvents: 'none' }}
    />
  )
}
