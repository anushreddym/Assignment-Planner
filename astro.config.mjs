// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'public' }),
      SUPABASE_PUBLISHABLE_KEY: envField.string({ context: 'server', access: 'public' }),
      SUPABASE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_SOURCE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
});
