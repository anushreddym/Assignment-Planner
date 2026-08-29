interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_PUBLISHABLE_KEY: string;
  readonly SUPABASE_SECRET_KEY?: string;
  readonly PUBLIC_SOURCE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}