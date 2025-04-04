import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  base: '/games/aircraft_wars/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },

  server: {
    open: true,
  },
});