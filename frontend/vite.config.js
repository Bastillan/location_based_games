import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';


export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  return defineConfig({
    plugins: [react()],
    server: {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, './certs/'+process.env.CERT+'-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, './certs/'+process.env.CERT+'.pem')),
      },
      proxy: { // setting proxy to backend
        host: '0.0.0.0',
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
        },
      },
  }
  });
}
