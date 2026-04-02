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
  created_at: number;
}

// GET /api/wrong-records — 获取当前用户错题列表
router.get("/", (req: Request, res: Response) => {
  const records = db
    .prepare(
      "SELECT id, level_id, detail, created_at FROM wrong_records WHERE user_id = ? ORDER BY level_id, created_at DESC",
    )
    .all(req.userId!) as WrongRecord[];

  const result = records.map((r) => ({
    id: r.id,
    levelId: r.level_id,
    detail: r.detail ? JSON.parse(r.detail) : null,
    createdAt: r.created_at,
  }));

  res.json({ records: result });
});

// GET /api/wrong-records/count — 获取错题数量
router.get("/count", (req: Request, res: Response) => {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM wrong_records WHERE user_id = ?")
    .get(req.userId!) as any;

  res.json({ count: row.count });
});

// POST /api/wrong-records — 写入错题记录
router.post("/", (req: Request, res: Response) => {
  const { levelId, command, output, hint } = req.body;

  if (typeof levelId !== "number") {
    res.status(400).json({ error: "无效的关卡 ID" });
    return;
  }

  const detail = JSON.stringify({
    command: command || "",
    output: (output || "").slice(0, 500),
    hint: hint || "",
  });

  const result = db
    .prepare(
      "INSERT INTO wrong_records (user_id, level_id, detail, created_at) VALUES (?, ?, ?, unixepoch())",
    )
    .run(req.userId!, levelId, detail);

  res.json({ id: result.lastInsertRowid });
});

// DELETE /api/wrong-records/:id — 删除单条错题
router.delete("/:id", (req: Request, res: Response) => {
  const result = db
    .prepare("DELETE FROM wrong_records WHERE id = ? AND user_id = ?")
    .run(Number(req.params.id), req.userId!);

  if (result.changes === 0) {
    res.status(404).json({ error: "记录不存在" });
    return;
  }

  res.json({ success: true });
});

// POST /api/wrong-records/seed — 为当前用户插入测试数据（开发用）
router.post("/seed", (req: Request, res: Response) => {
  // 先清理该用户已有的测试数据
  db.prepare("DELETE FROM wrong_records WHERE user_id = ?").run(req.userId!);

  const insert = db.prepare(
    "INSERT INTO wrong_records (user_id, level_id, detail, created_at) VALUES (?, ?, ?, ?)",
  );

  const now = Math.floor(Date.now() / 1000);
  const testRecords = [
    {
      levelId: 6,
      detail: JSON.stringify({
        command: "useradd alice",
        output: "useradd: Permission denied. (are you root?)",
        hint: "使用 adduser 命令创建用户 alice",
      }),
      createdAt: now - 86400 * 3,
    },
    {
      levelId: 6,
      detail: JSON.stringify({
        command: "adduser Alice",
        output: "adduser: unknown user Alice",
        hint: "使用 adduser 命令创建用户 alice",
      }),
      createdAt: now - 86400 * 2,
    },
    {
      levelId: 8,
      detail: JSON.stringify({
        command: "chmod 600 salary.txt",
        output: "chmod: cannot access 'salary.txt': No such file or directory",
        hint: "chmod 600 可以让文件只有所有者能读写",
      }),
      createdAt: now - 86400 * 2,
    },
    {
      levelId: 10,
      detail: JSON.stringify({
        command: "chmod 755 deploy.sh",
        output: "chmod: cannot access 'deploy.sh': No such file or directory",
        hint: "chmod +x 可以给脚本添加执行权限",
      }),
      createdAt: now - 86400,
    },
    {
      levelId: 15,
      detail: JSON.stringify({
        command: "netstat -tlnp",
        output:
          "Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address Foreign Address State PID/Program name",
        hint: "使用 netstat 或 ss 查看 nginx 监听的端口",
      }),
      createdAt: now - 3600 * 5,
    },
    {
      levelId: 22,
      detail: JSON.stringify({
        command: "ls /var/www/html",
        output: "ls: cannot access '/var/www/html': No such file or directory",
        hint: "使用 ls 检查部署目录中是否有 index.html",
      }),
      createdAt: now - 3600 * 3,
    },
    {
      levelId: 22,
      detail: JSON.stringify({
        command: "ls dist/",
        output: "index.html  assets/",
        hint: "使用 ls 检查部署目录中是否有 index.html",
      }),
      createdAt: now - 3600 * 2,
    },
    {
      levelId: 34,
      detail: JSON.stringify({
        command: "crontab -e",
        output: "no crontab for player - using an empty one",
        hint: "使用 crontab -e 编辑定时任务，或直接写入 /etc/crontab",
      }),
      createdAt: now - 3600,
    },
    {
      levelId: 41,
      detail: JSON.stringify({
        command: "bash system_report.sh",
        output:
          "system_report.sh: line 1: syntax error near unexpected token `then'",
        hint: "编写一个系统报告脚本，输出 CPU、内存、磁盘等信息",
      }),
      createdAt: now - 1800,
    },
  ];

  for (const record of testRecords) {
    insert.run(req.userId!, record.levelId, record.detail, record.createdAt);
  }

  res.json({ seeded: testRecords.length });
});

export default router;
