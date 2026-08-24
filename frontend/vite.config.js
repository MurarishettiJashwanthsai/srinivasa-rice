/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const verificationTags = [
    ['google-site-verification', env.VITE_GOOGLE_SITE_VERIFICATION],
    ['msvalidate.01', env.VITE_BING_SITE_VERIFICATION],
  ].filter(([, value]) => value)

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'search-engine-verification',
        transformIndexHtml(html) {
          return verificationTags.reduce((output, [name, value]) => {
            const safeValue = value.replace(/["<>]/g, '')
            const tag = `<meta name="${name}" content="${safeValue}" />`
            const markerIndex = output.indexOf(`name="${name}"`)

            if (markerIndex === -1) {
              return output.replace('</head>', `  ${tag}\n</head>`)
            }

            const tagStart = output.lastIndexOf('<meta', markerIndex)
            const tagEnd = output.indexOf('>', markerIndex)
            if (tagStart === -1 || tagEnd === -1) return output
            return `${output.slice(0, tagStart)}${tag}${output.slice(tagEnd + 1)}`
          }, html)
        },
      },
    ],
    build: isSsrBuild ? {} : {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion-vendor': ['framer-motion'],
            'ui-vendor': ['lucide-react', 'react-hot-toast'],
          },
        },
      },
    },
  }
})
