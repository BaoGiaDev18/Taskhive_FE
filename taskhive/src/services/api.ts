import axios from "axios";

// Host gốc của BE (KHÔNG có /api ở cuối)
const API_HOST = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Hub base: luôn là host gốc (prod = https://taskhive-zjch.onrender.com, dev = "")
export const HUB_BASE = API_HOST || "";

// Axios cho REST: baseURL = host gốc (KHÔNG /api)
// -> Mọi nơi trong code cứ gọi "/api/..." như trước là chạy cả dev (proxy) lẫn prod.
const api = axios.create({
  baseURL: API_HOST || "", // dev để "", đi qua proxy Vite; prod = domain BE
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
