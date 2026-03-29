import { Request, Response, NextFunction } from 'express'
import { verifyToken, signToken } from '../auth/utils.js'
import { TOKEN_REFRESH_THRESHOLD } from '../constants.js'

declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: '未提供认证 Token' })
    return
  }

  const token = authHeader.slice(7)
  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ error: 'Token 无效或已过期' })
    return
  }

  req.userId = decoded.userId

  // Silent token refresh: if token expires within 1 day, attach new token to response
  const originalSend = res.send.bind(res)
  res.send = function (data: any) {
    try {
      const payload = jwt.decode(token) as { exp?: number } | null
      if (payload?.exp) {
        const expiresAt = payload.exp * 1000
        const now = Date.now()
        const remaining = expiresAt - now
        if (remaining > 0 && remaining < TOKEN_REFRESH_THRESHOLD) {
          const newToken = signToken(decoded.userId)
          res.setHeader('X-New-Token', newToken)
        }
      }
    } catch {
      // Silently ignore token refresh errors
    }
    return originalSend(data)
  }

  next()
}

import jwt from 'jsonwebtoken'
