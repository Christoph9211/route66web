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
                dispensaryStRobert: 'dispensary-st-robert-mo.html',
                dispensaryNearFortLeonardWood:
                    'dispensary-near-fort-leonard-wood.html',
                route66DispensaryStRobert:
                    'route-66-dispensary-st-robert-mo.html',
            },
        },
    },
    optimizeDeps: {
        include: [
            '@fortawesome/free-brands-svg-icons',
            '@fortawesome/free-regular-svg-icons',
            '@fortawesome/free-solid-svg-icons',
        ],
    },
})
