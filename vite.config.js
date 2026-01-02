import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
  },

  preview: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [
      'amazonprofitfrontend-production.up.railway.app',
      'localhost',
      '127.0.0.1'
    ]
  }
})


