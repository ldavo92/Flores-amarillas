import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  // Deployed bajo /Flores-amarillas/ en GitHub Pages; raíz en dev local.
  base: mode === "production" ? "/Flores-amarillas/" : "/",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { host: true, port: 5173 },
}));
