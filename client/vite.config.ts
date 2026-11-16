import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((d) => !/three-|HeroParticles|AdminLayout|CalendlyModal|PerfHud|Contact-/i.test(d)),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('preload-helper') || id.includes('commonjsHelpers')) {
            return 'react';
          }
          if (
            /node_modules[\\/](?:react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\\/]/.test(
              id
            )
          ) {
            return 'react';
          }
          if (/node_modules[\\/]gsap[\\/]/.test(id)) {
            return 'gsap';
          }
          if (/node_modules[\\/]framer-motion[\\/]/.test(id)) {
            return 'motion';
          }
          if (/node_modules[\\/](?:three|@react-three)[\\/]/.test(id)) {
            return 'three';
          }
        },
      },
    },
  },
});
