import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.riv"],
  server: {
    proxy: {
      '/api': {
        target: 'https://safemumapi.onrender.com',
        changeOrigin: true,
        secure: false,
        credentials: true,
      }
    }
  }
})