import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
    }),
  ],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    unstubGlobals: true,
    globals: true,
  },
  // Use different ports than Vite's default ports to avoid this app's service worker influencing other apps.
  server: {
    port: 5174,
  },
  preview: {
    port: 4174,
  },
});
