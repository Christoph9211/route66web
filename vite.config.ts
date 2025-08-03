// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { resolve } from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        // outDir defaults to "dist".  Keep or change as you like.
        rollupOptions: {
          input: {
            
            main:  __dirname + '/index.html',         
            terms: __dirname + '/terms-of-service.html', 
            privacy: __dirname + '/privacy-policy.html'
            
          }
        }
      }
});
