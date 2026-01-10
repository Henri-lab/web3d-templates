---
id: layer-1-infrastructure
title: Layer 1 基础设施层
version: 1.0.0
status: published
layer: 1
created: 2024-01-05
updated: 2024-01-05
---

# Layer 1: 基础设施层 (Infrastructure Layer)

> 提供项目运行的基础环境、构建工具链和部署流程

---

## 概述

基础设施层是整个项目的技术底座，负责：

1. **项目脚手架** - 标准化的项目初始化
2. **构建配置** - Vite 优化配置
3. **部署流程** - CI/CD 自动化
4. **性能监控** - 运行时监控和告警

---

## 📁 目录结构

```
01-infrastructure/
├── README.md                 # 本文件
├── PROJECT-SCAFFOLD.md       # 项目脚手架规范
├── BUILD-CONFIG.md           # Vite 构建配置
├── DEPLOYMENT.md             # 部署流程文档
└── MONITORING.md             # 性能监控集成
```

---

## 🚀 项目脚手架

### 推荐的项目结构

```
history-3d-project/
├── public/
│   ├── models/              # 3D 模型文件 (.glb, .gltf)
│   ├── textures/            # 纹理贴图
│   ├── audio/               # 音频文件
│   └── stories/             # 故事包
│
├── src/
│   ├── components/          # React 组件
│   │   ├── canvas/          # 3D 画布组件
│   │   ├── objects/         # 3D 对象组件
│   │   ├── ui/              # UI 组件
│   │   └── layout/          # 布局组件
│   │
│   ├── stores/              # Zustand 状态管理
│   ├── hooks/               # 自定义 Hooks
│   ├── utils/               # 工具函数
│   ├── types/               # TypeScript 类型
│   ├── styles/              # 全局样式
│   ├── config/              # 配置文件
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── stories/                 # 历史故事源文件
│   └── [dynasty]/
│       └── [story-name]/
│           ├── story.md
│           ├── scenes/
│           └── assets/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### 初始化命令

```bash
# 使用 Vite 创建项目
npm create vite@latest history-3d-project -- --template react-ts

# 进入项目
cd history-3d-project

# 安装核心依赖
npm install three @react-three/fiber @react-three/drei gsap zustand

# 安装类型定义
npm install -D @types/three

# 安装可选依赖
npm install @react-three/postprocessing leva r3f-perf
```

---

## ⚙️ Vite 构建配置

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          animation: ['gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
  },

  server: {
    port: 3000,
    open: true,
  },

  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
})
```

### 环境变量配置

```bash
# .env.development
VITE_API_URL=http://localhost:3001
VITE_ASSETS_URL=/assets
VITE_ENABLE_DEVTOOLS=true

# .env.production
VITE_API_URL=https://api.history-3d.com
VITE_ASSETS_URL=https://cdn.history-3d.com
VITE_ENABLE_DEVTOOLS=false
```

---

## 🚢 部署流程

### Vercel 部署 (推荐)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/textures/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 静态资源缓存
    location ~* \.(glb|gltf|hdr|jpg|png|webp|mp3|ogg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 性能监控

### 集成 Web Vitals

```typescript
// src/utils/analytics.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

interface MetricData {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

function sendToAnalytics(metric: MetricData) {
  // 发送到分析服务
  console.log('[Performance]', metric)

  // 可选: 发送到后端
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function initPerformanceMonitoring() {
  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}
```

### Three.js 性能监控

```typescript
// src/components/canvas/PerformanceMonitor.tsx
import { useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

interface Stats {
  fps: number
  drawCalls: number
  triangles: number
  memory: number
}

export function PerformanceMonitor({ onStats }: { onStats?: (stats: Stats) => void }) {
  const { gl } = useThree()
  const [stats, setStats] = useState<Stats>({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    memory: 0,
  })

  let frameCount = 0
  let lastTime = performance.now()

  useFrame(() => {
    frameCount++
    const now = performance.now()

    if (now - lastTime >= 1000) {
      const info = gl.info
      const newStats: Stats = {
        fps: Math.round((frameCount * 1000) / (now - lastTime)),
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        memory: info.memory.geometries + info.memory.textures,
      }

      setStats(newStats)
      onStats?.(newStats)

      frameCount = 0
      lastTime = now

      // 性能告警
      if (newStats.fps < 30) {
        console.warn('[Performance] FPS below 30:', newStats.fps)
      }
      if (newStats.drawCalls > 100) {
        console.warn('[Performance] Too many draw calls:', newStats.drawCalls)
      }
    }
  })

  return null
}
```

---

## 📦 依赖管理

### package.json 模板

```json
{
  "name": "history-3d-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "analyze": "npx vite-bundle-visualizer"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "gsap": "^3.12.0",
    "@gsap/react": "^2.1.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "eslint": "^8.55.0",
    "vitest": "^1.0.0"
  }
}
```

---

## ✅ 基础设施层检查清单

### 项目初始化

- [ ] Vite + React + TypeScript 项目创建
- [ ] 核心依赖安装 (Three.js, R3F, GSAP, Zustand)
- [ ] 路径别名配置
- [ ] 环境变量配置

### 构建优化

- [ ] 代码分割配置
- [ ] 资源压缩配置
- [ ] 缓存策略配置
- [ ] 构建分析

### 部署配置

- [ ] Vercel/Docker 配置
- [ ] CI/CD 流程
- [ ] CDN 配置
- [ ] SSL 证书

### 监控集成

- [ ] Web Vitals 监控
- [ ] Three.js 性能监控
- [ ] 错误追踪
- [ ] 日志系统

---

## 📚 相关文档

- [PROJECT-SCAFFOLD.md](./PROJECT-SCAFFOLD.md) - 详细脚手架规范
- [BUILD-CONFIG.md](./BUILD-CONFIG.md) - 完整构建配置
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署流程详解
- [MONITORING.md](./MONITORING.md) - 监控系统集成

---

**基础设施层是项目的技术底座，确保构建快速、部署可靠、性能可监控！**
