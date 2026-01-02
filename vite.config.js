import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
  },

  preview: {
    host: true,
    port: 8080,
    allowedHosts: true // ✅ THIS IS THE FIX
  }
})
