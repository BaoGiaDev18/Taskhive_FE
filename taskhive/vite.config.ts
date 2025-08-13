import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // Dev: trỏ tới BE (chọn 1 trong 2 cái dưới)
        // target: "https://localhost:7062",
        target: "https://taskhive-zjch.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/hubs": {
        // LƯU Ý: Hub KHÔNG có /api
        // target: "https://localhost:7062",
        target: "https://taskhive-zjch.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
