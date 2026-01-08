import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target:'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
        // ws: true,
      }
      ,
      // Should UNCOMMENTED during the development and COMMENTED during production
      '/ws': {
        target: 'ws://localhost:8000',
        changeOrigin: true,
        ws: true,
      }
    },
  },
})

