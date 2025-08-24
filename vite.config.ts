import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('supabase')) return 'vendor-supabase';
            if (id.includes('ton')) return 'vendor-ton';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: increase warning limit
  },
  server: {
    port: 3000,
    https: {
      key: '', // path to your SSL key file, e.g. fs.readFileSync('./certs/key.pem')
      cert: '', // path to your SSL cert file, e.g. fs.readFileSync('./certs/cert.pem')
    },
  }
});
