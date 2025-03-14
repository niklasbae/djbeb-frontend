import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // ✅ Set a static port instead of random one
    strictPort: true, // ✅ Prevent Vite from switching to another port if 5173 is in use
    host: 'localhost' // Ensure it's accessible at localhost
  },
  css: {
    postcss: {},
  },
})
