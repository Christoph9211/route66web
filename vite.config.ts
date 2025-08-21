import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // outDir defaults to "dist".  Keep or change as you like.
    rollupOptions: {
      input: {
        main: 'index.html',
        terms: 'terms-of-service.html',
        privacy: 'privacy-policy.html',
        cookie: 'cookie-policy.html'
      }
    }
  }
});