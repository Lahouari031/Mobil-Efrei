import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// En développement, Vite redirige les appels /api vers le serveur Express (port 3000).
// Front et API semblent donc avoir la même origine : le cookie de session fonctionne sans CORS.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
