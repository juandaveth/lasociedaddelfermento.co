// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://lasociedaddelfermento.co',
  // /brandbook es de uso interno: no va al sitemap. /estilo era su nombre
  // anterior y queda redirigido para no romper enlaces viejos.
  redirects: { '/estilo': '/brandbook' },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/brandbook') && !page.includes('/estilo') }),
  ],
});
