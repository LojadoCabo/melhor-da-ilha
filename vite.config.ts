import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const mpPublicKey =
    process.env.MERCADO_PAGO_PUBLIC_KEY && process.env.MERCADO_PAGO_PUBLIC_KEY.startsWith('APP_USR-')
      ? process.env.MERCADO_PAGO_PUBLIC_KEY
      : process.env.VITE_MERCADO_PAGO_PUBLIC_KEY || process.env.MERCADO_PAGO_PUBLIC_KEY || '';

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY': JSON.stringify(mpPublicKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
