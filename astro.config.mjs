// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://lasociedaddelfermento.co',
  // /estilo es referencia interna: no va al sitemap.
  integrations: [sitemap({ filter: (page) => !page.includes('/estilo') })],
});
