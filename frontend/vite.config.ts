import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";

// SHA curto do commit, mostrado ao lado da versão no menu da conta (vira "dev" fora de um repositório git)
const gitSha = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return process.env.GIT_SHA || "dev";
  }
})();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (mode === "production" && !env.VITE_ODOO_DB?.trim()) {
    throw new Error("VITE_ODOO_DB é obrigatório em builds de produção; use, por exemplo, VITE_ODOO_DB=evoluta_staging npm run build");
  }

  return {
    plugins: [react()],
    define: { __GIT_SHA__: JSON.stringify(gitSha) },
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    server: {
      port: 8080,
      proxy: {
        "/api": { target: "http://localhost:8069", changeOrigin: true },
        "/web/session": { target: "http://localhost:8069", changeOrigin: true },
      },
    },
  };
});
