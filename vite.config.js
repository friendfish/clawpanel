import { defineConfig } from 'vite'
import { devApiPlugin } from './scripts/dev-api.js'
import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

// 读取 Gateway 端口（启动时读取一次）
let gatewayPort = 18789
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(homedir(), '.openclaw', 'openclaw.json'), 'utf8'))
  gatewayPort = cfg?.gateway?.port || 18789
} catch {}

export default defineConfig({
  plugins: [devApiPlugin()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    proxy: {
      '/ws': {
        target: `ws://127.0.0.1:${gatewayPort}`,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
