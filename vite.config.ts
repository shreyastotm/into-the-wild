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
        manualChunks: {
          // Bundle React ecosystem together - CRITICAL for proper functionality
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // UI libraries
          'vendor-ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          // Date utilities
          'vendor-date': ['date-fns', 'date-fns-tz'],
        },
        // Force new asset names with content hash for better caching
        entryFileNames: `assets/[name]-[hash]-v4.js`,
        chunkFileNames: `assets/[name]-[hash]-v4.js`,
        assetFileNames: `assets/[name]-[hash]-v4.[ext]`,
      },
    },
  },
}));
