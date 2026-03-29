import { Router, Request, Response } from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { EMOJI_AVATARS } from '../constants.js'

const router = Router()

// All user routes require authentication
router.use(authMiddleware)

// GET /api/user/profile
router.get('/profile', (req: Request, res: Response) => {
  const user = db.prepare('SELECT id, username, avatar, created_at FROM users WHERE id = ?')
    .get(req.userId!) as any

  if (!user) {
    res.status(404).json({ error: '用户不存在' })
    return
  }

  res.json({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.created_at,
  })
})

// PUT /api/user/avatar
router.put('/avatar', (req: Request, res: Response) => {
  const { avatar } = req.body

  if (!avatar || typeof avatar !== 'string' || avatar.length > 10) {
    res.status(400).json({ error: '无效的头像' })
    return
  }

  db.prepare('UPDATE users SET avatar = ?, updated_at = unixepoch() WHERE id = ?')
    .run(avatar, req.userId!)

  res.json({ avatar })
})

// GET /api/user/progress
router.get('/progress', (req: Request, res: Response) => {
  const progress = db.prepare('SELECT current_level, completed_levels FROM user_progress WHERE user_id = ?')
    .get(req.userId!) as any

  if (!progress) {
    // Create default progress if missing
    db.prepare('INSERT OR IGNORE INTO user_progress (user_id) VALUES (?)').run(req.userId!)
    res.json({ currentLevel: 1, completedLevels: [] })
    return
  }

  res.json({
    currentLevel: progress.current_level,
    completedLevels: JSON.parse(progress.completed_levels),
  })
})

// PUT /api/user/progress
router.put('/progress', (req: Request, res: Response) => {
  const { currentLevel, completedLevels } = req.body

  if (typeof currentLevel !== 'number' || !Array.isArray(completedLevels)) {
    res.status(400).json({ error: '无效的进度数据' })
    return
  }

  db.prepare(
    `INSERT INTO user_progress (user_id, current_level, completed_levels, updated_at)
     VALUES (?, ?, ?, unixepoch())
     ON CONFLICT(user_id) DO UPDATE SET
       current_level = excluded.current_level,
       completed_levels = excluded.completed_levels,
       updated_at = unixepoch()`
  ).run(req.userId!, currentLevel, JSON.stringify(completedLevels))

  res.json({ currentLevel, completedLevels })
})

// POST /api/user/progress/migrate
router.post('/progress/migrate', (req: Request, res: Response) => {
  const { completedLevels } = req.body

  if (!Array.isArray(completedLevels)) {
    res.status(400).json({ error: '无效的进度数据' })
    return
  }

  // Get existing progress
  const existing = db.prepare('SELECT current_level, completed_levels FROM user_progress WHERE user_id = ?')
    .get(req.userId!) as any

  const existingCompleted: number[] = existing ? JSON.parse(existing.completed_levels) : []

  // Merge: union of both sets
  const merged = Array.from(new Set([...existingCompleted, ...completedLevels])).sort((a, b) => a - b)
  const currentLevel = Math.max(existing?.current_level || 1, ...merged.map((l: number) => l + 1).filter(Boolean), 1)

  db.prepare(
    `INSERT INTO user_progress (user_id, current_level, completed_levels, updated_at)
     VALUES (?, ?, ?, unixepoch())
     ON CONFLICT(user_id) DO UPDATE SET
       current_level = excluded.current_level,
       completed_levels = excluded.completed_levels,
       updated_at = unixepoch()`
  ).run(req.userId!, currentLevel, JSON.stringify(merged))

  res.json({ currentLevel, completedLevels: merged })
})

// GET /api/user/emojis
router.get('/emojis', (_req: Request, res: Response) => {
  res.json({ emojis: EMOJI_AVATARS })
})

export default router
