import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubPagesPreview = process.env.VITE_GITHUB_PAGES === "true";

export default defineConfig({
  base: githubPagesPreview ? "/ROCKB2B/" : "/",
  plugins: [react()],
  server: { host: "0.0.0.0" },
  build: { sourcemap: false }
});
