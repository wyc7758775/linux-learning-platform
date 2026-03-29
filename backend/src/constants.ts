export const JWT_SECRET = process.env.JWT_SECRET || 'linux-learning-platform-jwt-secret-key-2024'
export const JWT_EXPIRES_IN = '3d' // 3 days
export const TOKEN_REFRESH_THRESHOLD = 1 * 24 * 60 * 60 * 1000 // 1 day in ms

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 64
export const USERNAME_MIN_LENGTH = 2
export const USERNAME_MAX_LENGTH = 20
export const MAX_LOGIN_FAIL_COUNT = 5

export const CAPTCHA_EXPIRES_MS = 5 * 60 * 1000 // 5 minutes

export const EMOJI_AVATARS = [
  '😀', '😎', '🤓', '🧑‍💻', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯',
  '🐸', '🐵', '🦄', '🐲', '🦋', '🐢', '🐙', '🦀', '🐝', '🐞',
  '🦈', '🐬', '🐳', '🦉', '🦅', '🐧', '🦜', '🐺', '🐻', '🐨',
  '🎭', '🎨', '🎯', '🎲', '🎵', '🎸', '🏆', '💎', '🔥', '⭐',
  '🌈', '☀️', '🌙', '❄️', '🌸', '🌻', '🍀', '🎃', '👻', '🎅',
  '🤖', '👾', '🎮', '🚀', '💡', '🔑', '📦', '🛡️', '⚔️', '🧩',
]
