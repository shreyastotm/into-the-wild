import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Disable type checking during build for faster builds
      // Type checking should be done separately via `npm run type-check`
      tsDecorators: true,
    }),
  ],
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
          if (id.includes('node_modules')) {
            // Bundle ALL React-related packages together - CRITICAL
            if (id.includes('react') || id.includes('react-dom') || 
                id.includes('react-router') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Large UI libraries
            if (id.includes('lucide') || id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            // Everything else
            return 'vendor';
          }
        },
        // Force new asset names with content hash for better caching
        entryFileNames: `assets/[name]-[hash]-v4.js`,
        chunkFileNames: `assets/[name]-[hash]-v4.js`,
        assetFileNames: `assets/[name]-[hash]-v4.[ext]`,
      },
    },
  },
}));
