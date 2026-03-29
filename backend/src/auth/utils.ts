import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXPIRES_IN, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, EMOJI_AVATARS } from '../constants.js'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export function getRandomAvatar(): string {
  return EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)]
}

export function validateUsername(username: string): string | null {
  if (!username || username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return `用户名长度必须为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 个字符`
  }
  // Support Chinese, English, digits, underscore
  if (!/^[\u4e00-\u9fff_a-zA-Z0-9]+$/.test(username)) {
    return '用户名只能包含中文、英文、数字和下划线'
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return `密码长度必须为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 个字符`
  }
  if (!/[A-Z]/.test(password)) {
    return '密码必须包含至少一个大写字母'
  }
  // Special characters: !@#$%^&*()_+-=[]{}|;':",./<>?
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>?]/.test(password)) {
    return '密码必须包含至少一个特殊符号'
  }
  return null
}
