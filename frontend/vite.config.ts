import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const apiTarget = process.env.VITE_API_BASE_URL ?? "http://localhost:8081";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy:
        mode === "development"
          ? {
              "/api": {
                target: apiTarget,
                changeOrigin: true,
                secure: false
              }
            }
          : undefined
    }
  };
});

