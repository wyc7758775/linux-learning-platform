import svgCaptcha from 'svg-captcha'
import { randomUUID } from 'crypto'
import { CAPTCHA_EXPIRES_MS } from '../constants.js'

interface CaptchaEntry {
  text: string
  expiresAt: number
}

// In-memory captcha store (sufficient for single-instance deployment)
const captchaStore = new Map<string, CaptchaEntry>()

// Periodic cleanup of expired captchas
setInterval(() => {
  const now = Date.now()
  for (const [id, entry] of captchaStore) {
    if (now > entry.expiresAt) {
      captchaStore.delete(id)
    }
  }
}, 60_000)

export function generateCaptcha(): { captchaId: string; svg: string } {
  const captchaId = randomUUID()
  const { text, data } = svgCaptcha.create({
    size: 4,
    noise: 3,
    color: true,
    background: '#f0f0f0',
    width: 120,
    height: 40,
  })

  captchaStore.set(captchaId, {
    text: text.toLowerCase(),
    expiresAt: Date.now() + CAPTCHA_EXPIRES_MS,
  })

  return { captchaId, svg: data }
}

export function verifyCaptcha(captchaId: string, code: string): { valid: boolean; expired: boolean } {
  const entry = captchaStore.get(captchaId)
  if (!entry) {
    return { valid: false, expired: true }
  }

  // Delete after use (one-time)
  captchaStore.delete(captchaId)

  if (Date.now() > entry.expiresAt) {
    return { valid: false, expired: true }
  }

  return { valid: entry.text === code.toLowerCase(), expired: false }
}
