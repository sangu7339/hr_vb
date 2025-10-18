 import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // or 'localhost' if you don’t need external access
    port: 5173,      // change to any port number you prefer
  },
})
