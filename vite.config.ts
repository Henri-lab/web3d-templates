import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import federation from '@originjs/vite-plugin-federation'

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
    // Module Federation 配置
    federation({
      name: 'shell',
      filename: 'remoteEntry.js',
      // 暴露给其他应用的模块
      exposes: {
        './PlatformAPI': './src/platform/core/platformAPI.ts',
        './EventBus': './src/platform/core/eventBus.ts',
        './SharedComponents': './src/components/index.ts',
      },
      // 共享依赖
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.21.0',
        },
        three: {
          singleton: true,
          requiredVersion: '^0.160.0',
        },
        '@react-three/fiber': {
          singleton: true,
          requiredVersion: '^8.15.0',
        },
        '@react-three/drei': {
          singleton: true,
          requiredVersion: '^9.92.0',
        },
        zustand: {
          singleton: true,
          requiredVersion: '^4.4.0',
        },
        gsap: {
          singleton: true,
          requiredVersion: '^3.12.0',
        },
        'framer-motion': {
          singleton: true,
          requiredVersion: '^10.16.0',
        },
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
    port: 5173,
    open: true,
    cors: true, // 允许跨域（Module Federation需要）
  },
})
