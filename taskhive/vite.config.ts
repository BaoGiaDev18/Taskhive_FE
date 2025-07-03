import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // https: true,
    proxy: {
      "/api": {
        target: "https://taskhive-zjch.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/hubs": {
        target: "https://taskhive-zjch.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
