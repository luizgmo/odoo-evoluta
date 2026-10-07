import { defineConfig } from "vite";
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

export default defineConfig({
  plugins: [react()],
  define: { __GIT_SHA__: JSON.stringify(gitSha) },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { port: 8080 },
});
