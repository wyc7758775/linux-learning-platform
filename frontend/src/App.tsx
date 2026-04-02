import { useState, useEffect } from "react";
import { Level } from "./components/Level/Level";
import { Terminal } from "./components/Terminal/Terminal";
import { Progress } from "./components/Progress/Progress";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { AvatarPicker } from "./components/AvatarPicker/AvatarPicker";
import { useTheme } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import { socket, connectSocket } from "./services/socket";
import { userApi, wrongRecordApi } from "./services/api";
import { LEVELS } from "./data/levels";
import type { Level as LevelType } from "./data/levels";
import { WrongNotebook } from "./components/WrongNotebook/WrongNotebook";

function App() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [levels, setLevels] = useState<LevelType[]>(LEVELS);
  const [sessionId, setSessionId] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"learn" | "notebook">("learn");
  const [tabAnim, setTabAnim] = useState<"learn" | "notebook" | null>(null);
  const [wrongRecordCount, setWrongRecordCount] = useState(0);
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  // Load progress from server on mount
  useEffect(() => {
    if (user) {
      userApi
        .getProgress()
        .then((res) => {
          const { currentLevel: cl, completedLevels } = res.data;
          setCurrentLevel(cl);
          setLevels((prev) =>
            prev.map((level) => ({
              ...level,
              completed: completedLevels.includes(level.id),
            })),
          );
          setProgressLoaded(true);
        })
        .catch(() => {
          // Fallback to localStorage if server unavailable
          const saved = localStorage.getItem("linux-learning-current-level");
          if (saved) setCurrentLevel(parseInt(saved, 10));
          const savedProgress = localStorage.getItem("linux-learning-progress");
          if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setLevels((prev) =>
              prev.map((level) => ({
                ...level,
                completed:
                  progress.completedLevels?.includes(level.id) || false,
              })),
            );
          }
          setProgressLoaded(true);
        });
    } else {
      setProgressLoaded(true);
    }
  }, [user]);

  // Save progress to server when level changes (only after initial load)
  useEffect(() => {
    if (!progressLoaded) return;
    if (user) {
      const completedLevels = levels
        .filter((l) => l.completed)
        .map((l) => l.id);
      userApi.updateProgress(currentLevel, completedLevels).catch(() => {});
    } else {
      localStorage.setItem(
        "linux-learning-current-level",
        String(currentLevel),
      );
    }
  }, [currentLevel, user]);

  useEffect(() => {
    connectSocket();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("session:created", (id: string) => {
      setSessionId(id);
    });

    socket.on("level:completed", (data: { levelId: number }) => {
      const completedLevelId = data.levelId;
      const nextLevel = completedLevelId + 1;
      setLevelCompleted(true);
      setCurrentLevel(nextLevel);
      setLevels((prev) => {
        const updated = prev.map((level) =>
          level.id === completedLevelId ? { ...level, completed: true } : level,
        );
        const completedLevels = updated
          .filter((l) => l.completed)
          .map((l) => l.id);
        // Save to server or localStorage
        const token = localStorage.getItem("linux-learning-token");
        if (token) {
          userApi.updateProgress(nextLevel, completedLevels).catch(() => {});
        } else {
          localStorage.setItem(
            "linux-learning-progress",
            JSON.stringify({ completedLevels }),
          );
          localStorage.setItem(
            "linux-learning-current-level",
            String(nextLevel),
          );
        }
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("session:created");
      socket.off("level:completed");
    };
  }, []);

  useEffect(() => {
    if (connected && currentLevel) {
      socket.emit("session:create", { levelId: currentLevel });
    }
  }, [connected, currentLevel]);

  // Fetch wrong record count
  useEffect(() => {
    if (user) {
      wrongRecordApi.getCount().then((res) => {
        setWrongRecordCount(res.data.count);
      }).catch(() => {});
    }
  }, [user, activeTab]);

  const switchTab = (tab: "learn" | "notebook") => {
    if (tab === activeTab) return;
    setTabAnim(tab);
    setActiveTab(tab);
  };

  const handleNextLevel = () => {
    if (currentLevel < levels.length) {
      setLevelCompleted(false);
      setCurrentLevel((prev) => prev + 1);
    }
  };

  const handleSelectLevel = (levelId: number) => {
    const level = levels.find((l) => l.id === levelId);
    if (
      level &&
      (level.id === 1 || levels.find((l) => l.id === levelId - 1)?.completed)
    ) {
      setLevelCompleted(false);
      setCurrentLevel(levelId);
    }
  };

  const activeLevel = levels.find((l) => l.id === currentLevel);
  const completedCount = levels.filter((l) => l.completed).length;

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
    >
      {/* Header - Fixed */}
      <header
        className={`shrink-0 z-50 border-b backdrop-blur-xl ${
          isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-green-600 to-emerald-700"
                } shadow-lg shadow-green-500/25`}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1
                className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Linux 命令行学习平台
              </h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => switchTab("learn")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "learn"
                    ? isDark
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-white text-slate-900 shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-slate-500 hover:text-slate-700"
                }`}
              >
                学习
              </button>
              <button
                onClick={() => switchTab("notebook")}
                className={`relative px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "notebook"
                    ? isDark
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-white text-slate-900 shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-slate-500 hover:text-slate-700"
                }`}
              >
                错题本
                {wrongRecordCount > 0 && (
                  <span
                    className={`min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      activeTab === "notebook"
                        ? "bg-red-500 text-white"
                        : isDark
                          ? "bg-red-500/20 text-red-400"
                          : "bg-red-100 text-red-500"
                    }`}
                  >
                    {wrongRecordCount > 99 ? "99+" : wrongRecordCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Progress badge */}
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isDark
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {completedCount}/{levels.length}
                </span>
              </div>

              {/* Connection Status */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                  connected
                    ? isDark
                      ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/20"
                      : "bg-green-50 text-green-600 ring-1 ring-green-200"
                    : isDark
                      ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                      : "bg-red-50 text-red-600 ring-1 ring-red-200"
                }`}
              >
                <span className={`relative flex h-2 w-2`}>
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      connected ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      connected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                </span>
                <span className="hidden sm:inline">
                  {connected ? "已连接" : "离线"}
                </span>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Avatar & Logout */}
              {user && (
                <div className="flex items-center gap-2">
                  <AvatarPicker currentAvatar={user.avatar} />
                  <button
                    onClick={logout}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isDark
                        ? "bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500"
                    }`}
                    title="退出登录"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {/* Learn View */}
      <div
        className={`flex-1 flex overflow-hidden ${
          activeTab === "learn"
            ? "pointer-events-auto"
            : "pointer-events-none absolute inset-0 opacity-0"
        } ${tabAnim === "learn" ? "tab-enter-learn" : tabAnim === "notebook" ? "tab-exit-learn" : ""}`}
      >
        {/* Left Sidebar - Scrollable */}
        <aside
          className={`w-full lg:w-[400px] flex-shrink-0 flex flex-col ${
            isDark ? "bg-slate-900/50" : "bg-slate-50"
          } ${isDark ? "lg:border-r lg:border-slate-800" : "lg:border-r lg:border-slate-200"}`}
        >
          <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col gap-4">
            <div className="h-[380px] flex-shrink-0">
              <Progress
                levels={levels}
                currentLevel={currentLevel}
                onSelectLevel={handleSelectLevel}
              />
            </div>
            {activeLevel && (
              <div className="flex-1 min-h-0">
                <Level
                  level={activeLevel}
                  completed={levelCompleted}
                  onNextLevel={handleNextLevel}
                  hasNextLevel={currentLevel < levels.length}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Fixed Terminal */}
        <main className="hidden lg:flex flex-1 flex-col min-w-0 p-4 sm:p-6">
          <div
            className={`flex-1 rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
              isDark
                ? "bg-slate-800/50 border-slate-700/50 shadow-black/20"
                : "bg-white border-slate-200 shadow-slate-200/50"
            }`}
          >
            {/* Terminal Header */}
            <div
              className={`shrink-0 px-4 py-3 flex items-center gap-3 ${
                isDark
                  ? "bg-slate-800/80 border-b border-slate-700/50"
                  : "bg-slate-100 border-b border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"></span>
                <span className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"></span>
              </div>
              <div className="flex-1 text-center">
                <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  player@linux:~
                </span>
              </div>
              <div className="w-16"></div>
            </div>
            <div className="flex-1 min-h-0">
              <Terminal sessionId={sessionId} levelId={currentLevel} />
            </div>
          </div>
        </main>
      </div>

      {/* Notebook View */}
      <div
        className={`flex-1 flex overflow-hidden ${
          activeTab === "notebook"
            ? "pointer-events-auto"
            : "pointer-events-none absolute inset-0 opacity-0"
        } ${tabAnim === "notebook" ? "tab-enter-notebook" : tabAnim === "learn" ? "tab-exit-notebook" : ""}`}
      >
        <div className={`flex-1 overflow-y-auto ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
          <WrongNotebook levels={levels} />
        </div>
        {/* Terminal hidden but kept alive */}
        <main className="hidden" aria-hidden="true">
          <Terminal sessionId={sessionId} levelId={currentLevel} />
        </main>
      </div>

      {/* Mobile Terminal Toggle */}
      <div className="lg:hidden shrink-0">
        <button
          className={`w-full py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            isDark
              ? "bg-slate-800 text-white border-t border-slate-700"
              : "bg-white text-slate-900 border-t border-slate-200"
          }`}
          onClick={() => {
            alert("移动端终端暂未完全适配，请使用桌面端获得最佳体验");
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          打开终端
        </button>
      </div>
    </div>
  );
}

export default App;
