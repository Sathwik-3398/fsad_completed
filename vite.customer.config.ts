import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: path.resolve(__dirname, 'portals/customer'),
  plugins: [react()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    hmr: false,
    fs: {
      allow: [path.resolve(__dirname, '.')]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-customer'),
    emptyOutDir: true
  }
});
