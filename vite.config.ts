import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  base: '.',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },

  server: {
    open: true,
  },
});