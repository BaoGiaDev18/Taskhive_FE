// src/services/api.ts
import axios from "axios";

// Host gốc của BE (không có /api ở cuối)
const API_HOST = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// REST base: prod dùng `${API_HOST}/api`, dev dùng proxy "/api"
export const REST_BASE = API_HOST ? `${API_HOST}/api` : "/api";
// Hub base: luôn là host gốc (KHÔNG có /api)
export const HUB_BASE = API_HOST || ""; // dev để rỗng -> đi qua proxy "/hubs"

const api = axios.create({
  baseURL: REST_BASE,
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
