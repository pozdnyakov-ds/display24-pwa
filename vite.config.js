import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      injectRegister: 'auto',
      manifest: {
        name: 'Display24 Player',
        short_name: 'D24 Player',
        description: 'Display24 Player',
        theme_color: '#000000',
        display: "fullscreen",
        orientation: "any",
        icons: [
          {
            src: 'img/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        "prefer_related_applications": true,
        "related_applications": [
          {
            "platform": "play",
            "id": "com.display24.web"
          }
        ]
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://dev116.ru/api',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ''),
  //     },
  //   },
  // },
})
