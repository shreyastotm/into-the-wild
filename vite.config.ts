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
    sourcemap: mode === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Let Vite handle automatic code splitting
        // This prevents cross-chunk dependency issues
        entryFileNames: `assets/entry-[name]-[hash]-v7.js`,
        chunkFileNames: `assets/chunk-[name]-[hash]-v7.js`,
        assetFileNames: `assets/asset-[name]-[hash]-v7.[ext]`,
      },
    },
  },
}));
