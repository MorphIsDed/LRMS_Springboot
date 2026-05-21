import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  // Ensure the target is always a full URL and does not get set to a relative path like '/api'
  let apiTarget = "http://localhost:8081";
  
  const envBaseUrl = process.env.VITE_API_BASE_URL;
  if (envBaseUrl && envBaseUrl.startsWith("http")) {
    apiTarget = envBaseUrl;
  }

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
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, "")
              }
            }
          : undefined
    }
  };
});

