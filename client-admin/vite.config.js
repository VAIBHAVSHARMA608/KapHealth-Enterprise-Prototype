import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Runs on a different port from the patient/doctor app (5173) so both can
// run side by side locally. In production these are two separate static
// deployments, both talking to the same backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/uploads": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
