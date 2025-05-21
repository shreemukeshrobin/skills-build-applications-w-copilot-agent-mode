import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Assuming Django runs on port 8000
        changeOrigin: true,
        // The rewrite rule below is important if your Django URLs are already prefixed with /api.
        // If your Django URLs are like /deals/ (without /api prefix from Django's perspective),
        // then you might need to rewrite: (path) => path.replace(/^\/api/, '')
        // However, given the Django setup where urls.py has path('api/', include('deals.urls')),
        // the /api prefix is part of the Django URL structure, so we keep it.
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
