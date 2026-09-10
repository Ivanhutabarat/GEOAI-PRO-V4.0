import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: { 
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      maxParallelFileOps: 1,
      cache: false,
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          maps: ['@vis.gl/react-google-maps'],
          utils: ['jspdf', 'html2canvas', 'react-markdown', 'recharts']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'GeoAI Pro v4.0',
        short_name: 'GeoAI Pro',
        description: 'Geophysical Digital Twin Workstation',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  define: {
    'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'lucide-react', 'recharts', 'motion/react',
      'three', '@react-three/fiber', '@react-three/drei', 'jspdf', 'html2canvas',
      'zustand', 'react-router-dom', 'react-markdown', 'clsx', 'tailwind-merge', 'qrcode.react'
    ]
  }
});
