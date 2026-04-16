import { COLORS } from '../constants'
import type { Particle } from '../types'

export function createParticle(x: number, y: number): Particle {
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
    decay: Math.random() * 0.015 + 0.01,
  }
}
