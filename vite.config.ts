import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

// Vite plugin to inject permissive CSP meta tag in development
const cspPlugin = (isDev: boolean): Plugin => ({
  name: "csp-override-dev",
  transformIndexHtml(html) {
    // Only in development mode
    if (isDev) {
      // Remove any existing CSP meta tag and inject a new one without nonce
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; style-src 'self' 'unsafe-inline' https: http: data:; font-src 'self' data: https: http:; img-src 'self' data: https: http: blob:; connect-src 'self' ws: wss: https: http:; frame-src 'self' https: http:; base-uri 'self'; object-src 'none';">`;

      // Remove existing CSP meta tags
      html = html.replace(
        /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
        "",
      );

      // Insert new CSP meta tag right after viewport meta tag
      html = html.replace(
        /(<meta\s+name=["']viewport["'][^>]*>)/i,
        `$1\n    ${cspMeta}`,
      );
    }
    return html;
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Relax CSP headers in development - explicitly NO nonce to allow browser extensions
    // When nonce is present, 'unsafe-inline' is ignored per CSP spec
    headers:
      mode === "development"
        ? {
            "Content-Security-Policy":
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; style-src 'self' 'unsafe-inline' https: http: data:; font-src 'self' data: https: http:; img-src 'self' data: https: http: blob:; connect-src 'self' ws: wss: https: http:; frame-src 'self' https: http:; base-uri 'self'; object-src 'none';",
          }
        : undefined,
  },
  plugins: [
    react({
      // Disable type checking during build for faster builds
      // Type checking should be done separately via `npm run type-check`
      tsDecorators: true,
    }),
    // Add CSP override plugin for development
    ...(mode === "development" ? [cspPlugin(true)] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent duplicate React copies across chunks/deps (fixes invalid hook call)
    dedupe: ["react", "react-dom"],
  },
  build: {
    // TEMP: enable sourcemaps in production to debug stack overflows
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
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
