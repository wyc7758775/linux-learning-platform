import { useRef } from 'react'
import { useFireworkAudio } from './hooks/useFireworkAudio'
import { useFireworkCanvas } from './hooks/useFireworkCanvas'
import type { FireworkProps, Particle } from './types'

export function Firework({ onComplete, duration = 3000 }: FireworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { playSound, stopAllAudio } = useFireworkAudio()

  useFireworkCanvas({
    canvasRef,
    particlesRef,
    animationRef,
    timeoutRef,
    duration,
    onComplete,
    playSound,
    stopAllAudio,
  })

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40"
      style={{ willChange: 'transform', pointerEvents: 'none' }}
    />
  )
}
