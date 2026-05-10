import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix loads ALL vars (not just VITE_*) from .env
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_TARGET || 'http://localhost:3002'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // All /api/* requests are forwarded to the backend — the browser
        // only ever sees your own origin, never the backend URL or port.
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          // Pass error responses (4xx, 5xx) through as-is — don't convert them to 500
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              // Only handle actual connection errors (server unreachable), not HTTP errors
              if (res && !res.headersSent) {
                (res as import('http').ServerResponse).writeHead(503, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, message: 'Service unavailable' }))
              }
            })
          },
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
