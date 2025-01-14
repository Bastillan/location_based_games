import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: { // setting proxy to backend
        '/api': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        }
      },
  }
  });
}
