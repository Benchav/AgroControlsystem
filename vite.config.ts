import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.svg', 'pwa-512.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ['**/spline-runtime-*.js', '**/physics-*.js'],
      },
      manifest: {
        name: 'Agro Control',
        short_name: 'Agro Control',
        description: 'Smart farm platform with IoT, AI, marketplace and 3D visualization.',
        theme_color: '#1e1e2f',
        background_color: '#1e1e2f',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@splinetool/runtime')) {
            return 'spline-runtime';
          }

          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'map-runtime';
          }

          if (id.includes('node_modules')) {
            return 'vendor';
          }

          return undefined;
        },
      },
    },
  },
} );