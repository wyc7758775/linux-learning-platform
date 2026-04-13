import { useState, useEffect, useRef, useCallback } from "react";
import { Level } from "./components/Level/Level";
import { Terminal } from "./components/Terminal/Terminal";
import { Progress } from "./components/Progress/Progress";
import { AvatarPicker } from "./components/AvatarPicker/AvatarPicker";
import { useTheme } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import { socket, connectSocket } from "./services/socket";
import { userApi, wrongRecordApi } from "./services/api";
import { LEVELS } from "./data/levels";
import type { Level as LevelType } from "./data/levels";
import { WrongNotebook } from "./components/WrongNotebook/WrongNotebook";
import { formatDir, HOME_DIR } from "./utils/terminal";
import { classifyError, isExploratoryCommand } from "./utils/classifyError";

function App() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [levels, setLevels] = useState<LevelType[]>(LEVELS);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentDir, setCurrentDir] = useState<string>(HOME_DIR);
  const [connected, setConnected] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"learn" | "notebook">("learn");
  const [wrongRecordCount, setWrongRecordCount] = useState(0);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const levelsRef = useRef<LevelType[]>(LEVELS);
  const currentLevelRef = useRef<number>(1);
  const terminalPanelRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    levelsRef.current = levels;
  }, [levels]);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  const fetchWrongRecordCount = useCallback(() => {
    if (!user) {
      setWrongRecordCount(0);
      return;
    }

    wrongRecordApi
      .getCount()
      .then((res) => {
        setWrongRecordCount(res.data.count);
      })
      .catch(() => {});
  }, [user]);

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

    socket.on("session:created", (session: { id: string; currentDir: string }) => {
      setSessionId(session.id);
      setCurrentDir(session.currentDir);
    });

    socket.on("session:error", () => {
      setSessionId("");
    });

    socket.on("level:completed", (data: { levelId: number }) => {
      const completedLevelId = data.levelId;
      const previousLevels = levelsRef.current;
      const currentLevelState = previousLevels.find((level) => level.id === completedLevelId);
      const nextLevel = previousLevels.find((level) => level.id === completedLevelId + 1);
      const shouldShowCompletionPrompt =
        !!currentLevelState &&
        !currentLevelState.completed &&
        !!nextLevel &&
        !nextLevel.completed;

      setLevelCompleted(shouldShowCompletionPrompt);
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
          userApi.updateProgress(completedLevelId, completedLevels).catch(() => {});
        } else {
          localStorage.setItem(
            "linux-learning-progress",
            JSON.stringify({ completedLevels }),
          );
          localStorage.setItem(
            "linux-learning-current-level",
            String(completedLevelId),
          );
        }
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("session:created");
      socket.off("session:error");
      socket.off("level:completed");
    };
  }, []);

  useEffect(() => {
    if (connected && currentLevel) {
      setSessionId("");
      socket.emit("session:create", { levelId: currentLevel });
    }
  }, [connected, currentLevel]);

  useEffect(() => {
    fetchWrongRecordCount();
  }, [fetchWrongRecordCount, activeTab]);

  const handleCommandResult = useCallback(
    async (command: string, output: string, completed: boolean) => {
      if (completed || !user) {
        return;
      }

      if (isExploratoryCommand(command)) {
        return;
      }

      const levelId = currentLevelRef.current;
      const activeLevelState = levelsRef.current.find((level) => level.id === levelId);

      if (!activeLevelState || activeLevelState.completed) {
        return;
      }

      const analysis = classifyError(command, output);

      try {
        await wrongRecordApi.create(
          levelId,
          command,
          output,
          activeLevelState.hint,
          analysis.type,
        );
        fetchWrongRecordCount();
      } catch {
        // silently fail
      }
    },
    [fetchWrongRecordCount, user],
  );

  const switchTab = (tab: "learn" | "notebook") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  const exitTerminalExpanded = useCallback(() => {
    setIsTerminalExpanded(false);
  }, []);

  const toggleTerminalExpanded = useCallback(() => {
    setIsTerminalExpanded((current) => !current);
  }, []);

  useEffect(() => {
    if (!isTerminalExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exitTerminalExpanded();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [exitTerminalExpanded, isTerminalExpanded]);

  useEffect(() => {
    if (activeTab !== "learn" && isTerminalExpanded) {
      exitTerminalExpanded();
    }
  }, [activeTab, exitTerminalExpanded, isTerminalExpanded]);

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
  const terminalButtonLabel = isTerminalExpanded ? "恢复终端" : "放大终端";

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
            <div className="flex items-center gap-3 sm:gap-4">
              <img src="/app-icon.svg" alt="Logo" className="w-8 h-8 shrink-0" />

              <div
                className={`relative isolate inline-grid grid-cols-2 items-center rounded-xl p-1 ${
                  isDark ? "bg-slate-800/90" : "bg-slate-100"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out ${
                    isDark
                      ? "bg-slate-700 shadow-sm shadow-black/20"
                      : "bg-white shadow-sm shadow-slate-200/80"
                  } ${activeTab === "notebook" ? "translate-x-full" : "translate-x-0"}`}
                />
                <button
                  onClick={() => switchTab("learn")}
                  className={`relative z-10 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "learn"
                      ? isDark
                        ? "text-white"
                        : "text-slate-900"
                      : isDark
                        ? "text-slate-400 hover:text-slate-300"
                        : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  学习
                </button>
                <button
                  onClick={() => switchTab("notebook")}
                  className={`relative z-10 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "notebook"
                      ? isDark
                        ? "text-white"
                        : "text-slate-900"
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

              {/* User Avatar */}
              {user && (
                <div className="flex items-center">
                  <AvatarPicker currentAvatar={user.avatar} />
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
        }`}
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
                  showCompletionPrompt={levelCompleted}
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
            ref={terminalPanelRef}
            className={`flex-1 rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
              isDark
                ? "bg-slate-800/50 border-slate-700/50 shadow-black/20"
                : "bg-white border-slate-200 shadow-slate-200/50"
            } ${
              isTerminalExpanded
                ? isDark
                  ? "fixed inset-0 z-[70] rounded-none border-0 shadow-none bg-slate-950"
                  : "fixed inset-0 z-[70] rounded-none border-0 shadow-none bg-slate-50"
                : ""
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
              <div className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full ${
                    isDark ? "bg-slate-600/90" : "bg-slate-300"
                  }`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full ${
                    isDark ? "bg-slate-600/90" : "bg-slate-300"
                  }`}
                ></span>
                <button
                  type="button"
                  onClick={toggleTerminalExpanded}
                  aria-label={terminalButtonLabel}
                  title={terminalButtonLabel}
                  className={`group relative flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 ${
                    isDark
                      ? "focus-visible:ring-offset-slate-800"
                      : "focus-visible:ring-offset-slate-100"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                      isTerminalExpanded
                        ? isDark
                          ? "bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.24)]"
                          : "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.18)]"
                        : isDark
                          ? "bg-emerald-500 group-hover:bg-emerald-400"
                          : "bg-emerald-500 group-hover:bg-emerald-600"
                    }`}
                  ></span>
                </button>
              </div>
              <div className="flex-1 text-center">
                <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {`player@linux:${formatDir(currentDir)}`}
                </span>
              </div>
              <div
                className={`shrink-0 text-[11px] font-medium tracking-[0.08em] uppercase ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {isTerminalExpanded ? "Focus" : "Terminal"}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <Terminal
                sessionId={sessionId}
                levelId={currentLevel}
                initialDir={currentDir}
                onDirectoryChange={setCurrentDir}
                onCommandResult={handleCommandResult}
              />
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
        }`}
      >
        <div className={`flex-1 overflow-y-auto ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
          <WrongNotebook levels={levels} />
        </div>
        {/* Terminal hidden but kept alive */}
        <main className="hidden" aria-hidden="true">
          <Terminal
            sessionId={sessionId}
            levelId={currentLevel}
            initialDir={currentDir}
            onDirectoryChange={setCurrentDir}
          />
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
