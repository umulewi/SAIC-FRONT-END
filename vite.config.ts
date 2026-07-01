import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://saic-mis-backend-1.onrender.com',
        // target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://saic-mis-backend-1.onrender.com',
        // target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
