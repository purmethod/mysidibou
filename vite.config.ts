import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    server: {
      watch: { usePolling: true, interval: 150 },
    },
    resolve: {
      tsconfigPaths: true,
    },
    // Nitro builds the server for the deployment target (Vercel preset) and
    // integrates with Vercel's serverless functions automatically.
    plugins: [
      tanstackStart({ server: { entry: "server" } }),
      nitro(),
      react(),
      tailwindcss(),
    ],
  };
});