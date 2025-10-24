import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for development only
    sourcemap: mode === 'development',
    // Minify output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.log statements in production
        drop_debugger: true,
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Implement code splitting with manual chunks
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            // Keep React and React-DOM together - CRITICAL for proper functionality
            if (id.includes('react') || id.includes('react-dom') || 
                id.includes('scheduler') || id.includes('prop-types')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide') || id.includes('radix') || id.includes('shadcn')) {
              return 'vendor-ui';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date-fns';
            }
            return 'vendor';
          }
          
          // Split app code by feature
          if (id.includes('/components/admin/')) {
            return 'admin';
          }
          if (id.includes('/components/trek/')) {
            return 'trek';
          }
          if (id.includes('/components/profile/')) {
            return 'profile';
          }
          if (id.includes('/pages/forum/')) {
            return 'forum';
          }
          if (id.includes('/components/auth/')) {
            return 'auth';
          }
        },
        // Force new asset names with content hash for better caching
        entryFileNames: `assets/[name]-[hash]-v3.js`,
        chunkFileNames: `assets/[name]-[hash]-v3.js`,
        assetFileNames: `assets/[name]-[hash]-v3.[ext]`,
      },
    },
  },
}));
