import react from "@vitejs/plugin-react-swc";
import { execSync } from "child_process";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(
      execSync("git rev-parse HEAD").toString().trim(),
    ),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "LittleTrack",
        short_name: "LittleTrack",
        description: "Simple time tracking",
        theme_color: "#262626",
        icons: [
          {
            src: "/pwa_icon_192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa_icon_512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa_icon_192x192_maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
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
