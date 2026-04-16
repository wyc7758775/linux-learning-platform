export interface Particle {
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

export interface FireworkProps {
  onComplete?: () => void
  duration?: number
}
