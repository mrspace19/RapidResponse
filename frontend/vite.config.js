import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The port where your Express server is running
const API_SERVER_PORT = 3000

export default defineConfig({
  plugins: [
    react(), // keep React plugin only
  ],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${API_SERVER_PORT}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
