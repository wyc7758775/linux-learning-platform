import { Router, Request, Response } from "express";
import db from "../db/index.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All wrong-records routes require authentication
router.use(authMiddleware);

interface WrongRecord {
  id: number;
  user_id: number;
  level_id: number;
  detail: string | null;
  error_type: string;
  attempt_count: number;
  created_at: number;
  archived_at: number | null;
}

const VALID_ERROR_TYPES = new Set([
  "permission",
  "notfound",
  "syntax",
  "command",
  "empty",
  "logic",
]);

// GET /api/wrong-records — 获取当前用户错题列表
router.get("/", (req: Request, res: Response) => {
  const records = db
    .prepare(
      "SELECT id, level_id, detail, error_type, attempt_count, created_at, archived_at FROM wrong_records WHERE user_id = ? AND archived_at IS NULL ORDER BY level_id, created_at DESC",
    )
    .all(req.userId!) as WrongRecord[];

  const result = records.map((r) => ({
    id: r.id,
    levelId: r.level_id,
    detail: r.detail ? JSON.parse(r.detail) : null,
    errorType: r.error_type,
    attemptCount: r.attempt_count,
    createdAt: r.created_at,
  }));

  res.json({ records: result });
});

// GET /api/wrong-records/count — 获取错题数量
router.get("/count", (req: Request, res: Response) => {
  const row = db
    .prepare(
      "SELECT COUNT(*) as count FROM wrong_records WHERE user_id = ? AND archived_at IS NULL",
    )
    .get(req.userId!) as any;

  res.json({ count: row.count });
});

// POST /api/wrong-records — 写入错题记录
router.post("/", (req: Request, res: Response) => {
  const { levelId, command, output, hint, errorType } = req.body;

  if (typeof levelId !== "number") {
    res.status(400).json({ error: "无效的关卡 ID" });
    return;
  }

  if (typeof errorType !== "string" || !VALID_ERROR_TYPES.has(errorType)) {
    res.status(400).json({ error: "无效的错误类型" });
    return;
  }

  const detail = JSON.stringify({
    command: command || "",
    output: (output || "").slice(0, 500),
    hint: hint || "",
  });

  const findActiveRecord = db.prepare(
    "SELECT id, attempt_count FROM wrong_records WHERE user_id = ? AND level_id = ? AND error_type = ? AND archived_at IS NULL",
  );
  const updateActiveRecord = db.prepare(
    "UPDATE wrong_records SET detail = ?, attempt_count = attempt_count + 1, created_at = unixepoch() WHERE id = ? AND user_id = ?",
  );
  const insertActiveRecord = db.prepare(
    "INSERT INTO wrong_records (user_id, level_id, error_type, detail, attempt_count, created_at, archived_at) VALUES (?, ?, ?, ?, 1, unixepoch(), NULL)",
  );

  const record = db.transaction(() => {
    const existing = findActiveRecord.get(req.userId!, levelId, errorType) as
      | { id: number; attempt_count: number }
      | undefined;

    if (existing) {
      updateActiveRecord.run(detail, existing.id, req.userId!);
      return {
        id: existing.id,
        attemptCount: existing.attempt_count + 1,
      };
    }

    const inserted = insertActiveRecord.run(req.userId!, levelId, errorType, detail);
    return {
      id: Number(inserted.lastInsertRowid),
      attemptCount: 1,
    };
  })();

  res.json({ id: record.id, attemptCount: record.attemptCount });
});

// PATCH /api/wrong-records/:id/archive — 归档当前错题
router.patch("/:id/archive", (req: Request, res: Response) => {
  const result = db
    .prepare(
      "UPDATE wrong_records SET archived_at = unixepoch() WHERE id = ? AND user_id = ? AND archived_at IS NULL",
    )
    .run(Number(req.params.id), req.userId!);

  if (result.changes === 0) {
    res.status(404).json({ error: "记录不存在" });
    return;
  }

  res.json({ success: true });
});

export default router;
