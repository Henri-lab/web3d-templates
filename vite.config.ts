import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // 禁用 Babel 转换，保留原始代码
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
    },
    // 强制使用开发版本
    conditions: ['development'],
  },
  // 定义全局常量
  define: {
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  build: {
    sourcemap: true,
    // 禁用代码转换和压缩
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
    // 禁用依赖优化时的代码转换
    esbuildOptions: {
      target: 'esnext',
      minify: false,
      keepNames: true,
      treeShaking: false,
    },
  },
  // 禁用 esbuild 转换
  esbuild: {
    target: 'esnext',
    keepNames: true,
    minify: false,
  },
  server: {
    port: 3000,
    open: true,
  },
})
