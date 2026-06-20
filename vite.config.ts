import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/DorkNio/',
  plugins: [react()],
  build: {
    // Extension-friendly: don't split vendor chunks,
    // keep all JS in one file so manifest can reference it cleanly
    rollupOptions: {
      output: {
        // Single chunk — avoids cross-origin issues in extensions
        manualChunks: undefined,
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
