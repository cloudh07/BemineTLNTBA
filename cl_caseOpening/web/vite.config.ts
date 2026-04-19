/// <reference types="vitest" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }]
        ]
      }
    })
  ],
  base: './',
  build: {
    outDir: 'build',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('reflect-metadata')) {
              return undefined;
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('mobx')) {
              return 'vendor-mobx';
            }
            if (id.includes('@iconify')) {
              return 'vendor-icons';
            }
            if (id.includes('motion') || id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('virtuoso')) {
              return 'vendor-virtuoso';
            }
            if (id.includes('inversify')) {
              return 'vendor-di';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
            return 'vendor-other';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        compact: true,
        exports: 'auto'
      },
      treeshake: {
        moduleSideEffects: (id) => {
          if (id && id.includes('reflect-metadata')) {
            return true;
          }
          return false;
        },
        propertyReadSideEffects: false
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    target: 'esnext',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    reportCompressedSize: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'mobx',
      'mobx-react-lite',
      '@iconify/react',
      'motion',
      'inversify',
      'reflect-metadata'
    ]
  },
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    drop: ['debugger'],
    pure: []
  }
});