import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Vite 配置 - 稳健版本
 *
 * 移除了 Module Federation，简化配置
 */
export default defineConfig({
  plugins: [
    react({
      babel: {
        babelrc: false,
        configFile: false,
        plugins: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@types': resolve(__dirname, 'src/types'),
      '@dsl': resolve(__dirname, 'src/dsl'),
      '@animations': resolve(__dirname, 'src/animations'),
      '@platform': resolve(__dirname, 'src/platform'),
    },
    conditions: ['development'],
  },
  define: {
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-animation': ['gsap', 'framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
    esbuildOptions: {
      target: 'esnext',
      minify: false,
      keepNames: true,
      treeShaking: false,
    },
  },
  esbuild: {
    target: 'esnext',
    keepNames: true,
    minify: false,
  },
  server: {
    port: 5173,
    open: true,
  },
})
