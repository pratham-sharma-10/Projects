import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Prototype is fully client-side. base is set so it can be served from a
// sub-path (e.g. inside the monorepo's static hosting) as well as at root.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5175,
    open: false,
  },
});
