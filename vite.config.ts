import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import glsl from 'vite-plugin-glsl'
import { resolve } from 'path'

/**
 * Vite 配置说明
 *
 * 目标：
 * - dev 模式：源码尽量清晰，方便进入 React / Three / 自己的代码里调试
 * - build 模式：使用标准生产构建，最小体积 & 构建速度优先
 */
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      // React 支持（JSX、Fast Refresh）
      react({
        babel: {
          babelrc: false,
          configFile: false,
          plugins: [],
        },
      }),

      // 自动导入常用 API（减少手写 import）
      AutoImport({
        // 可以按需再扩展，比如 zustand / react-router-dom 等
        imports: ['react'],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      }),

      // GLSL 导入支持：允许直接 import *.glsl / *.vert / *.frag 等着色器文件
      glsl({
        include: ['**/*.glsl', '**/*.wgsl', '**/*.vert', '**/*.frag'],
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
      // 不强行写死 'development' 条件，让 Vite 根据 mode 自动选择 React 的 dev/prod 构建
    },

    /**
     * 让 React 正确识别 dev / prod
     * - dev: __DEV__ = true，process.env.NODE_ENV = 'development'
     * - prod: __DEV__ = false，process.env.NODE_ENV = 'production'
     */
    define: {
      __DEV__: !isProd,
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
    },

    /**
     * 生产构建配置（npm run build）
     * - 使用 esbuild 压缩 JS（默认）
     * - target: 'esnext' 保留现代语法，减少 polyfill
     * - sourcemap 默认关闭，真实线上更小更快；需要分析 bundle 时可以临时改为 true
     */
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
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

    /**
     * 依赖预构建配置（主要影响 dev）
     * - 不做 minify，保留较好的结构，方便在 dev 模式下走进 React / Three 的代码
     * - keepNames: true 保留函数名，调用栈更可读
     *
     * 说明：
     * - 这里的设置只影响 dev 时的依赖预构建，不影响生产 bundle
     */
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
      esbuildOptions: {
        target: 'esnext',
        minify: false,
        keepNames: true,
        treeShaking: false,
      },
    },

    /**
     * 源码编译配置
     * - 主要影响 dev 下的 TS/JS 转译
     * - 生产压缩由 build.minify 控制，这里不再写 minify
     */
    esbuild: {
      target: 'esnext',
      keepNames: true,
    },

    server: {
      port: 5173,
      open: true,
    },
  }
})
