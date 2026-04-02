import axios from "axios";

// 扩展 axios 配置，支持自定义字段
declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

const API_BASE = import.meta.env.PROD ? "" : "";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("linux-learning-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: silent token refresh
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-new-token"];
    if (newToken) {
      localStorage.setItem("linux-learning-token", newToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      localStorage.removeItem("linux-learning-token");
      localStorage.removeItem("linux-learning-user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authApi = {
  register: (username: string, password: string) =>
    api.post(
      "/auth/register",
      { username, password },
      { skipAuthRedirect: true },
    ),
  login: (
    username: string,
    password: string,
    captchaId?: string,
    captchaCode?: string,
  ) =>
    api.post(
      "/auth/login",
      { username, password, captchaId, captchaCode },
      { skipAuthRedirect: true },
    ),
  getCaptcha: () => api.get("/auth/captcha"),
  refreshToken: () => api.post("/auth/refresh"),
};

// User APIs
export const userApi = {
  getProfile: () => api.get("/user/profile"),
  updateAvatar: (avatar: string) => api.put("/user/avatar", { avatar }),
  getProgress: () => api.get("/user/progress"),
  updateProgress: (currentLevel: number, completedLevels: number[]) =>
    api.put("/user/progress", { currentLevel, completedLevels }),
  migrateProgress: (completedLevels: number[]) =>
    api.post("/user/progress/migrate", { completedLevels }),
  getEmojis: () => api.get("/user/emojis"),
};

// Wrong Records APIs
export const wrongRecordApi = {
  getList: () => api.get("/wrong-records"),
  getCount: () => api.get("/wrong-records/count"),
  create: (levelId: number, command: string, output: string, hint: string) =>
    api.post("/wrong-records", { levelId, command, output, hint }),
  remove: (id: number) => api.delete(`/wrong-records/${id}`),
  seed: () => api.post("/wrong-records/seed"),
};

export default api;
