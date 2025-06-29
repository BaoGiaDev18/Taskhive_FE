import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // https: true,
    proxy: {
      "/api": {
        target: "https://localhost:7062",
        changeOrigin: true,
        secure: false,
      },
      "/hubs": {
        target: "https://localhost:7062",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
