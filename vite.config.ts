import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        // outDir defaults to "dist".  Keep or change as you like.
        cssCodeSplit: true,
        rollupOptions: {
            input: {
                main: 'index.html',
                privacy: 'privacy-policy.html',
                terms: 'terms-of-service.html',
                cookie: 'cookie-policy.html',
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) {
                            return 'react-vendor'
                        }
                        if (id.includes('@vercel')) {
                            return 'observability'
                        }
                        if (id.includes('@fortawesome')) {
                            return 'icons'
                        }
                        return 'vendor'
                    }
                },
            },
        },
    },
    optimizeDeps: {
        include: [
            '@vercel/analytics/react',
            '@vercel/speed-insights/react',
            '@fortawesome/free-brands-svg-icons',
            '@fortawesome/free-regular-svg-icons',
            '@fortawesome/free-solid-svg-icons',
        ],
    },
})
