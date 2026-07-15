import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'https://api.saicmis.com',
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        // target: 'https://api.saicmis.com',
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
