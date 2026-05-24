import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'Logo.png',
        'pwa-192.svg',
        'pwa-512.svg',
        'fondo.jpg',
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ['**/spline-runtime-*.js', '**/physics-*.js'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/$/, /^\/app(\/.*)?$/],
      },
      manifest: {
        name: 'Agro Control — Smart Farm Platform',
        short_name: 'Agro Control',
        description:
          'Plataforma de agricultura inteligente con IoT, diagnóstico IA, marketplace y visualización 3D.',
        theme_color: '#1e1e2f',
        background_color: '#1e1e2f',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        id: '/',
        categories: ['agriculture', 'productivity', 'utilities'],
        prefer_related_applications: false,
        icons: [
          {
            src: '/Logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/Logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/Logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/Logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
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