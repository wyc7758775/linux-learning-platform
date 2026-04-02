import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { wrongRecordApi } from "../../services/api";
import type { Level } from "../../data/levels";

interface WrongNotebookProps {
  levels: Level[];
}

interface WrongRecordDetail {
  command: string;
  output: string;
  hint: string;
}

interface WrongRecord {
  id: number;
  levelId: number;
  detail: WrongRecordDetail | null;
  createdAt: number;
}

interface GroupedRecords {
  levelId: number;
  level: Level | undefined;
  records: WrongRecord[];
  chapterName: string;
}

function formatTime(unix: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unix;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
  const d = new Date(unix * 1000);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatFullTime(unix: number): string {
  const d = new Date(unix * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const chapterNames: Record<number, string> = {
  1: "基础命令",
  2: "权限实战",
  3: "事故响应",
  4: "部署上线",
  5: "DevOps 实战",
  6: "脚本编程",
  7: "网络排查",
};

const chapterColors: Record<
  number,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  1: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    darkBg: "bg-blue-500/10",
    darkText: "text-blue-400",
  },
  2: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    darkBg: "bg-amber-500/10",
    darkText: "text-amber-400",
  },
  3: {
    bg: "bg-red-50",
    text: "text-red-600",
    darkBg: "bg-red-500/10",
    darkText: "text-red-400",
  },
  4: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    darkBg: "bg-purple-500/10",
    darkText: "text-purple-400",
  },
  5: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    darkBg: "bg-emerald-500/10",
    darkText: "text-emerald-400",
  },
  6: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    darkBg: "bg-cyan-500/10",
    darkText: "text-cyan-400",
  },
  7: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    darkBg: "bg-pink-500/10",
    darkText: "text-pink-400",
  },
};

function getDefaultChapter() {
  return {
    bg: "bg-slate-50",
    text: "text-slate-600",
    darkBg: "bg-slate-500/10",
    darkText: "text-slate-400",
  };
}

export function WrongNotebook({ levels }: WrongNotebookProps) {
  const { isDark } = useTheme();
  const [records, setRecords] = useState<WrongRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<WrongRecord | null>(
    null,
  );
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await wrongRecordApi.getList();
      setRecords(res.data.records);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Auto-select first record on desktop
  useEffect(() => {
    if (records.length > 0 && !selectedRecord) {
      setSelectedRecord(records[0]);
    }
  }, [records, selectedRecord]);

  const groupedRecords: GroupedRecords[] = (() => {
    const map = new Map<number, WrongRecord[]>();
    for (const r of records) {
      if (!map.has(r.levelId)) map.set(r.levelId, []);
      map.get(r.levelId)!.push(r);
    }
    return Array.from(map.entries()).map(([levelId, recs]) => ({
      levelId,
      level: levels.find((l) => l.id === levelId),
      records: recs,
      chapterName:
        chapterNames[levels.find((l) => l.id === levelId)?.chapter || 0] ||
        "未知章节",
    }));
  })();

  const handleDelete = async (id: number) => {
    try {
      await wrongRecordApi.remove(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) {
        const remaining = records.filter((r) => r.id !== id);
        setSelectedRecord(remaining.length > 0 ? remaining[0] : null);
      }
    } catch {
      // silently fail
    }
  };

  const handleSeed = async () => {
    try {
      await wrongRecordApi.seed();
      setLoading(true);
      await fetchRecords();
    } catch {
      // silently fail
    }
  };

  const latestRecord =
    records.length > 0
      ? records.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
      : null;

  const stats = {
    total: records.length,
    levels: groupedRecords.length,
    latestTime: latestRecord ? formatTime(latestRecord.createdAt) : "-",
    chapters: new Set(
      groupedRecords.map((g) => g.level?.chapter).filter(Boolean),
    ).size,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-8 h-8 border-2 rounded-full animate-spin ${
              isDark
                ? "border-slate-600 border-t-blue-400"
                : "border-slate-200 border-t-blue-500"
            }`}
          />
          <span
            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            加载中...
          </span>
        </div>
      </div>
    );
  }

  // Empty state
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="flex flex-col items-center text-center max-w-md">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${
              isDark ? "bg-slate-800" : "bg-slate-100"
            }`}
          >
            <svg
              className={`w-10 h-10 ${isDark ? "text-slate-600" : "text-slate-300"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            暂无错题记录
          </h3>
          <p
            className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            继续挑战关卡吧！做错的题目会自动记录在这里，方便你回顾和巩固。
          </p>
          <button
            onClick={handleSeed}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            加载测试数据
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Master List */}
      <div
        className={`${
          mobileShowDetail ? "hidden md:flex" : "flex"
        } w-full md:w-[420px] lg:w-[480px] flex-shrink-0 flex-col ${
          isDark ? "border-r border-slate-700/50" : "border-r border-slate-200"
        }`}
      >
        {/* Stats Bar */}
        <div
          className={`px-5 py-4 border-b ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark ? "bg-red-500/10" : "bg-red-50"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${isDark ? "text-red-400" : "text-red-500"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2
                className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                错题本
              </h2>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isDark
                  ? "bg-slate-700 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {stats.total} 条
            </span>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`rounded-lg px-3 py-2 ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}
            >
              <div
                className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                涉及关卡
              </div>
              <div
                className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {stats.levels}
              </div>
            </div>
            <div
              className={`rounded-lg px-3 py-2 ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}
            >
              <div
                className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                涉及章节
              </div>
              <div
                className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {stats.chapters}
              </div>
            </div>
            <div
              className={`rounded-lg px-3 py-2 ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}
            >
              <div
                className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                最近错误
              </div>
              <div
                className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {stats.latestTime}
              </div>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto">
          {groupedRecords.map((group) => {
            const ch = group.level?.chapter || 0;
            const colors = chapterColors[ch] || getDefaultChapter();

            return (
              <div key={group.levelId}>
                {/* Group Header */}
                <div
                  className={`sticky top-0 px-5 py-2.5 flex items-center gap-2 ${
                    isDark
                      ? "bg-slate-900/90 backdrop-blur-sm"
                      : "bg-slate-50/90 backdrop-blur-sm"
                  }`}
                >
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? colors.darkBg + " " + colors.darkText : colors.bg + " " + colors.text}`}
                  >
                    {group.chapterName}
                  </span>
                  <span
                    className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  >
                    Level {group.levelId} ·{" "}
                    {group.level?.title || `关卡 ${group.levelId}`}
                  </span>
                  <span
                    className={`text-[10px] ml-auto ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {group.records.length} 次
                  </span>
                </div>

                {/* Record Items */}
                {group.records.map((record) => {
                  const isSelected = selectedRecord?.id === record.id;
                  return (
                    <button
                      key={record.id}
                      onClick={() => {
                        setSelectedRecord(record);
                        setMobileShowDetail(true);
                      }}
                      className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors cursor-pointer border-l-2 ${
                        isSelected
                          ? isDark
                            ? "bg-slate-800/80 border-blue-500"
                            : "bg-blue-50/80 border-blue-500"
                          : isDark
                            ? "border-transparent hover:bg-slate-800/40"
                            : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          isDark ? "bg-red-500/10" : "bg-red-50"
                        }`}
                      >
                        <svg
                          className={`w-3.5 h-3.5 ${isDark ? "text-red-400" : "text-red-500"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <code
                          className={`text-xs font-mono block truncate ${
                            isDark ? "text-amber-400" : "text-amber-600"
                          }`}
                        >
                          $ {record.detail?.command || "(空)"}
                        </code>
                        <div
                          className={`text-[10px] mt-1 truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {record.detail?.output?.slice(0, 60) || "无输出"}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] flex-shrink-0 mt-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}
                      >
                        {formatTime(record.createdAt)}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Detail View */}
      <div
        className={`${
          mobileShowDetail ? "flex" : "hidden md:flex"
        } flex-1 flex-col min-w-0`}
      >
        {selectedRecord ? (
          <DetailPanel
            record={selectedRecord}
            level={levels.find((l) => l.id === selectedRecord.levelId)}
            isDark={isDark}
            onDelete={handleDelete}
            onBack={() => setMobileShowDetail(false)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p
              className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              选择一条记录查看详情
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailPanel({
  record,
  level,
  isDark,
  onDelete,
  onBack,
}: {
  record: WrongRecord;
  level: Level | undefined;
  isDark: boolean;
  onDelete: (id: number) => void;
  onBack: () => void;
}) {
  const ch = level?.chapter || 0;
  const colors = chapterColors[ch] || getDefaultChapter();
  const chapterName = chapterNames[ch] || "未知章节";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Detail Header */}
      <div
        className={`px-6 py-5 border-b ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
      >
        {/* Mobile back button */}
        <button
          onClick={onBack}
          className={`md:hidden flex items-center gap-1 text-xs mb-3 cursor-pointer ${
            isDark
              ? "text-slate-400 hover:text-slate-300"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回列表
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? colors.darkBg + " " + colors.darkText : colors.bg + " " + colors.text}`}
              >
                {chapterName}
              </span>
              <span
                className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Level {record.levelId}
              </span>
            </div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {level?.title || `关卡 ${record.levelId}`}
            </h3>
            {level?.description && (
              <p
                className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {level.description}
              </p>
            )}
          </div>
          <span
            className={`text-xs flex-shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            {formatFullTime(record.createdAt)}
          </span>
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 px-6 py-6 space-y-5">
        {/* Command */}
        <div>
          <div
            className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            执行命令
          </div>
          <div
            className={`rounded-xl px-5 py-4 font-mono text-sm ${
              isDark
                ? "bg-slate-800/80 text-amber-400 ring-1 ring-slate-700/50"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50"
            }`}
          >
            <span className={isDark ? "text-slate-500" : "text-slate-400"}>
              ${" "}
            </span>
            {record.detail?.command || "(空)"}
          </div>
        </div>

        {/* Output */}
        {record.detail?.output && (
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              输出结果
            </div>
            <div
              className={`rounded-xl px-5 py-4 font-mono text-sm whitespace-pre-wrap break-all max-h-48 overflow-y-auto ${
                isDark
                  ? "bg-slate-800/80 text-red-400 ring-1 ring-slate-700/50"
                  : "bg-red-50 text-red-600 ring-1 ring-red-200/50"
              }`}
            >
              {record.detail.output}
            </div>
          </div>
        )}

        {/* Hint */}
        {record.detail?.hint && (
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              正确提示
            </div>
            <div
              className={`rounded-xl px-5 py-4 text-sm ${
                isDark
                  ? "bg-emerald-500/5 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>{record.detail.hint}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Analysis */}
        <div>
          <div
            className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            错误分析
          </div>
          <div
            className={`rounded-xl px-5 py-4 text-sm ${
              isDark
                ? "bg-slate-800/50 ring-1 ring-slate-700/50"
                : "bg-white ring-1 ring-slate-200"
            }`}
          >
            <ErrorAnalysis record={record} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark ? "border-slate-700/50" : "border-slate-200"
        }`}
      >
        <span
          className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          记录 #{record.id}
        </span>
        <button
          onClick={() => onDelete(record.id)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              : "text-slate-400 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          删除此记录
        </button>
      </div>
    </div>
  );
}

function ErrorAnalysis({
  record,
  isDark,
}: {
  record: WrongRecord;
  isDark: boolean;
}) {
  const output = record.detail?.output || "";
  const command = record.detail?.command || "";

  let errorType = "unknown";
  let errorLabel = "未知错误";
  let errorDesc = "";

  if (/permission denied/i.test(output) || /are you root/i.test(output)) {
    errorType = "permission";
    errorLabel = "权限不足";
    errorDesc = "命令需要 root 权限，尝试在命令前加上 sudo。";
  } else if (/no such file|not found|cannot access/i.test(output)) {
    errorType = "notfound";
    errorLabel = "文件/路径不存在";
    errorDesc = "目标文件或路径不存在，请先确认路径是否正确。";
  } else if (/syntax error/i.test(output)) {
    errorType = "syntax";
    errorLabel = "语法错误";
    errorDesc = "脚本存在语法问题，仔细检查 if/then/fi 等配对关键字。";
  } else if (/command not found/i.test(output)) {
    errorType = "command";
    errorLabel = "命令未找到";
    errorDesc = "系统没有安装该命令，请先使用 apk add 安装对应的包。";
  } else if (output.trim().length === 0) {
    errorType = "empty";
    errorLabel = "命令无输出";
    errorDesc = "命令执行成功但没有产生期望的输出，检查命令参数是否正确。";
  } else if (command.trim().length === 0) {
    errorType = "empty";
    errorLabel = "空命令";
    errorDesc = "没有输入任何命令就提交了，请先输入对应的 Linux 命令。";
  } else {
    errorType = "logic";
    errorLabel = "逻辑错误";
    errorDesc = "命令可以执行但结果不符合预期，对照提示重新思考解决思路。";
  }

  const typeStyles: Record<
    string,
    { bg: string; text: string; darkBg: string; darkText: string }
  > = {
    permission: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      darkBg: "bg-orange-500/10",
      darkText: "text-orange-400",
    },
    notfound: {
      bg: "bg-red-50",
      text: "text-red-600",
      darkBg: "bg-red-500/10",
      darkText: "text-red-400",
    },
    syntax: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      darkBg: "bg-purple-500/10",
      darkText: "text-purple-400",
    },
    command: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      darkBg: "bg-amber-500/10",
      darkText: "text-amber-400",
    },
    empty: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      darkBg: "bg-slate-500/10",
      darkText: "text-slate-400",
    },
    logic: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      darkBg: "bg-blue-500/10",
      darkText: "text-blue-400",
    },
    unknown: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      darkBg: "bg-slate-500/10",
      darkText: "text-slate-400",
    },
  };

  const style = typeStyles[errorType] || typeStyles.unknown;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? style.darkBg + " " + style.darkText : style.bg + " " + style.text}`}
        >
          {errorLabel}
        </span>
      </div>
      <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {errorDesc}
      </p>
    </div>
  );
}
