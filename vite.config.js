import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.riv"],
  server: {
    proxy: {
      '/api': {
        target: 'https://web-production-97d93.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})