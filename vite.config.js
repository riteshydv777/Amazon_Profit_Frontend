import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true, // OK
  },

  preview: {
    port: 8080,
    host: true,
    allowedHosts: [
      'amazonprofitfrontend-production.up.railway.app'
    ]
  }
})
