import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fix-react-leaflet-draw',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('react-leaflet-draw') && id.includes('EditControl.js')) {
          return code.replace(/import Draw from 'leaflet-draw';/g, "import 'leaflet-draw';");
        }
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'Logo.png',
        'Logo-192.png',
        'Logo-512.png',
        'fondo.jpg',
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ['**/spline-runtime-*.js', '**/physics-*.js'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/$/, /^\/app(\/.*)?$/],
        disableDevLogs: true,
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
            src: '/Logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/Logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/Logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/Logo-512.png',
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
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@splinetool/runtime')) {
            return 'spline-runtime';
          }

          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'map-runtime';
          }

          if (id.includes('three') || id.includes('@react-three')) {
            return 'three-runtime';
          }

          if (id.includes('recharts')) {
            return 'recharts';
          }

          if (id.includes('jspdf') || id.includes('xlsx') || id.includes('html2canvas')) {
            return 'export-tools';
          }

          return undefined;
        },
      },
    },
  },
});