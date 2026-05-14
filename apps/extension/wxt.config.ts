import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  outDir: '.output',
  manifest: {
    name: 'Rethink',
    description: 'A pause before you spend. Friction-injection for impulsive purchases.',
    permissions: ['storage', 'activeTab'],
    action: {
      default_title: 'Rethink',
      default_popup: 'popup.html',
    },
    icons: {
      16: 'icons/16.png',
      48: 'icons/48.png',
      128: 'icons/128.png',
    },
    default_locale: 'en',
  },
});
