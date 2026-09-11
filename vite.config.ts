import { tanstackStart } from "@tanstack/react-start/plugin/vite";
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
    plugins: [
      tanstackStart({ server: { entry: "server" } }),
      react(),
      tailwindcss(),
    ],
  };
});