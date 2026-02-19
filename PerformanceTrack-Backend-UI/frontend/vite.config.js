import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for PerformanceTrack Frontend
// The API proxy forwards all /api requests to the Spring API Gateway (port 8092)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8092',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
