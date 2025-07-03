// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://taskhive-zjch.onrender.com", // <-- đổi cho đúng với backend
  timeout: 5000,
});

// (Tuỳ chọn) Thêm interceptor để tự động đính token vào header nếu có:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token && config.headers) {
    // Cách đơn giản nhất: chỉ cần gán thêm key Authorization
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
