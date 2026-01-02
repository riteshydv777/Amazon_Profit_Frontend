import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Dev server (not used on Railway, but keep clean)
  server: {
    host: true,
    port: 5173,
  },

  // 🔥 THIS is what Railway uses
  preview: {
    host: true,
    port: 8080,
    allowedHosts: 'all', // ✅ REQUIRED for Railway
  },
})
