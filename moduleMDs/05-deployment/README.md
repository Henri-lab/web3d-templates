# 部署指南

> 生产环境部署完整指南

## 📖 概述

本文档提供了中台平台从开发到生产环境的完整部署指南，包括构建、部署、配置和监控等各个方面。

## 📚 文档导航

1. [本地开发](./local-development.md) - 本地开发环境配置
2. [生产构建](./production-build.md) - 生产版本构建
3. [Module Federation 部署](./module-federation.md) - 微前端部署
4. [故障排查](./troubleshooting.md) - 常见问题和解决方案

## 🚀 快速部署

### 1. 构建生产版本

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 2. 部署到服务器

```bash
# 将 dist 目录部署到服务器
scp -r dist/* user@server:/var/www/html/

# 或使用 rsync
rsync -avz dist/ user@server:/var/www/html/
```

### 3. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    # 单页应用路由配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 🏗️ 部署架构

### 单体部署

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx 服务器                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  静态文件 (dist/)                               │    │
│  │  - index.html                                   │    │
│  │  - assets/                                      │    │
│  │  - modules/                                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 微前端部署

```
┌─────────────────────────────────────────────────────────┐
│                    主应用服务器                          │
│  http://main.example.com                                │
│  - Shell 应用                                            │
│  - 平台核心                                              │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  故事模块      │  │  实验室模块    │  │  地球模块      │
│  :5174        │  │  :5175        │  │  :5176        │
└───────────────┘  └───────────────┘  └───────────────┘
```

## 🔧 环境配置

### 开发环境

```bash
# .env.development
VITE_APP_MODE=development
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEVTOOLS=true
```

### 生产环境

```bash
# .env.production
VITE_APP_MODE=production
VITE_API_URL=https://api.example.com
VITE_ENABLE_DEVTOOLS=false
```

### 使用环境变量

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_MODE': JSON.stringify(process.env.VITE_APP_MODE),
  },
})

// 在代码中使用
const apiUrl = import.meta.env.VITE_API_URL
```

## 📦 构建优化

### 1. 代码分割

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'platform-core': ['./src/platform/core'],
        },
      },
    },
  },
})
```

### 2. 资源压缩

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
})
```

### 3. 图片优化

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: {
        plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs', active: false }],
      },
    }),
  ],
})
```

## 🔒 安全配置

### 1. CSP 配置

```nginx
# Nginx 配置
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.example.com;";
```

### 2. HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 性能监控

### 1. 添加性能监控

```typescript
// src/utils/performance.ts
export function reportWebVitals(metric: any) {
  // 发送到分析服务
  console.log(metric)

  // 或发送到后端
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  })
}

// src/main.tsx
import { reportWebVitals } from './utils/performance'

reportWebVitals(console.log)
```

### 2. 错误监控

```typescript
// src/utils/errorTracking.ts
export function setupErrorTracking() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    // 发送到错误追踪服务
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // 发送到错误追踪服务
  })
}

// src/main.tsx
import { setupErrorTracking } from './utils/errorTracking'

setupErrorTracking()
```

## 🔄 CI/CD 配置

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to server
        uses: easingthemes/ssh-deploy@v2
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/html
```

## 📝 部署检查清单

### 构建前

- [ ] 更新版本号
- [ ] 运行测试
- [ ] 检查 ESLint 错误
- [ ] 检查 TypeScript 错误
- [ ] 更新依赖到最新稳定版本

### 构建时

- [ ] 使用生产环境配置
- [ ] 启用代码压缩
- [ ] 启用资源优化
- [ ] 生成 source map

### 部署后

- [ ] 验证所有页面可访问
- [ ] 验证所有功能正常
- [ ] 检查控制台错误
- [ ] 检查网络请求
- [ ] 测试性能指标
- [ ] 验证 SEO 配置

## 🐛 常见问题

### 1. 路由 404 错误

**问题**: 刷新页面时出现 404 错误

**解决**: 配置服务器将所有请求重定向到 index.html

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. 静态资源加载失败

**问题**: CSS/JS 文件加载失败

**解决**: 检查 base 路径配置

```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // 或 '/your-app/'
})
```

### 3. 环境变量未生效

**问题**: 环境变量在生产环境中未生效

**解决**: 确保环境变量以 `VITE_` 开头

```bash
# ✅ 正确
VITE_API_URL=https://api.example.com

# ❌ 错误
API_URL=https://api.example.com
```

## 📚 相关文档

- [本地开发](./local-development.md)
- [生产构建](./production-build.md)
- [Module Federation 部署](./module-federation.md)
- [故障排查](./troubleshooting.md)

---

**最后更新**: 2026-01-10
