import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the build works at any URL (GitHub Pages subpath included)
  base: './',
  plugins: [react()],
})
