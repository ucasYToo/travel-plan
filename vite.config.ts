import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    minify: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: false,
    exclude: ['js/**', 'node_modules', 'dist'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      exclude: [
        'js/**',
        'src/data/**',
        'src/main.tsx',
        'src/test/**',
        'src/App.tsx',
        'src/components/MapView.tsx',
        'vite.config.ts',
        '*.config.*'
      ]
    }
  }
})
