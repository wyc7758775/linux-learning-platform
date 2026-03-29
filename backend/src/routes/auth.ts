import { Router, Request, Response } from 'express'
import db from '../db/index.js'
import { hashPassword, comparePassword, signToken, verifyToken, getRandomAvatar, validateUsername, validatePassword } from '../auth/utils.js'
import { generateCaptcha, verifyCaptcha } from '../auth/captcha.js'
import { MAX_LOGIN_FAIL_COUNT } from '../constants.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // Validate username
    const usernameError = validateUsername(username)
    if (usernameError) {
      res.status(400).json({ error: usernameError })
      return
    }

    // Validate password
    const passwordError = validatePassword(password)
    if (passwordError) {
      res.status(400).json({ error: passwordError })
      return
    }

    // Check if username already exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) {
      res.status(409).json({ error: '用户名已存在' })
      return
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const avatar = getRandomAvatar()

    const result = db.prepare(
      'INSERT INTO users (username, password_hash, avatar) VALUES (?, ?, ?)'
    ).run(username, passwordHash, avatar)

    // Create empty progress for user
    db.prepare('INSERT INTO user_progress (user_id) VALUES (?)').run(result.lastInsertRowid)

    // Sign token
    const token = signToken(Number(result.lastInsertRowid))

    res.status(201).json({
      token,
      user: {
        id: Number(result.lastInsertRowid),
        username,
        avatar,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: '注册失败，请稍后重试' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, captchaId, captchaCode } = req.body

    if (!username || !password) {
      res.status(400).json({ error: '请提供用户名和密码' })
      return
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username as string) as any
    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    // Check if CAPTCHA is required
    if (user.login_fail_count >= MAX_LOGIN_FAIL_COUNT) {
      if (!captchaId || !captchaCode) {
        res.status(401).json({
          error: '请完成验证码验证',
          needCaptcha: true,
          failCount: user.login_fail_count,
        })
        return
      }

      const captchaResult = verifyCaptcha(captchaId, captchaCode)
      if (captchaResult.expired) {
        res.status(400).json({ error: '验证码已过期，请重新获取' })
        return
      }
      if (!captchaResult.valid) {
        res.status(400).json({ error: '验证码错误', needCaptcha: true })
        return
      }
    }

    // Verify password
    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      const newFailCount = user.login_fail_count + 1
      db.prepare('UPDATE users SET login_fail_count = ?, updated_at = unixepoch() WHERE id = ?')
        .run(newFailCount, user.id)

      res.status(401).json({
        error: '用户名或密码错误',
        failCount: newFailCount,
        needCaptcha: newFailCount >= MAX_LOGIN_FAIL_COUNT,
        remainingAttempts: Math.max(0, MAX_LOGIN_FAIL_COUNT - newFailCount),
      })
      return
    }

    // Success: reset fail count
    db.prepare('UPDATE users SET login_fail_count = 0, updated_at = unixepoch() WHERE id = ?')
      .run(user.id)

    const token = signToken(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: '登录失败，请稍后重试' })
  }
})

// GET /api/auth/captcha
router.get('/captcha', (_req: Request, res: Response) => {
  const { captchaId, svg } = generateCaptcha()
  res.json({ captchaId, svg })
})

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
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

  const newToken = signToken(decoded.userId)
  res.json({ token: newToken })
})

export default router
