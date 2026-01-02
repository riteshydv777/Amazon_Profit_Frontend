import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
  },

  preview: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: false,
    allowedHosts: [
      'amazonprofitfrontend-production.up.railway.app',
      '.railway.app'
    ]
  }
})