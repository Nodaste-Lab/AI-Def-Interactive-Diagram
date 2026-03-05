import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/embed.tsx'),
      output: {
        format: 'iife',
        entryFileNames: 'nodaste-diagram.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'nodaste-diagram.css';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
})
