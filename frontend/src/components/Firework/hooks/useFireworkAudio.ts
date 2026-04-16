import { useCallback, useRef } from 'react'

export function useFireworkAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const activeSourcesRef = useRef<AudioScheduledSourceNode[]>([])
  const activeNodesRef = useRef<AudioNode[]>([])

  const stopAllAudio = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop()
      } catch {
        // Ignore sources that already ended.
      }

      try {
        source.disconnect()
      } catch {
        // Ignore disconnect failures during teardown.
      }
    }

    for (const node of activeNodesRef.current) {
      try {
        node.disconnect()
      } catch {
        // Ignore disconnect failures during teardown.
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
  }, [])

  return { playSound, stopAllAudio }
}
