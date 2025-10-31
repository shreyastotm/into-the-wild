/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

