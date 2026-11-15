import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: '/aharwise/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/testSetup.ts',
  },
})
