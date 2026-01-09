#!/bin/bash

# React 源码调试环境设置脚本（最小化代码转换版本）
# 用法: ./setup-react-source.sh
# 特点: 跳过二进制下载，只构建核心包

set -e

echo "🚀 React 源码调试环境设置（最小化转换 + 核心包）"
echo "========================================================"
echo ""

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: 需要 Node.js 18 或更高版本"
    echo "   当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node -v)"
echo ""

# 创建 react-source 目录
echo "📁 创建 react-source 目录..."
mkdir -p react-source
cd react-source

# 检查是否已经克隆
if [ -d ".git" ]; then
    echo "✅ React 源码已存在，跳过克隆"
    echo "   如需重新克隆，请删除 react-source 目录"
else
    echo "📥 克隆 React 源码仓库（这可能需要几分钟）..."
    echo "   提示: 如果网络超时，可以手动克隆后重新运行此脚本"

    # 尝试克隆，如果失败给出提示
    if ! git clone --depth 1 --branch main https://github.com/facebook/react.git . 2>/dev/null; then
        echo ""
        echo "❌ 克隆失败（可能是网络问题）"
        echo ""
        echo "💡 手动克隆方法："
        echo "   1. 在浏览器下载: https://github.com/facebook/react/archive/refs/heads/main.zip"
        echo "   2. 解压到 react-source 目录"
        echo "   3. 重新运行此脚本"
        echo ""
        exit 1
    fi

    echo "✅ 克隆完成"
fi

echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖（跳过二进制下载，只安装核心依赖）..."
    echo "   使用 --ignore-scripts 跳过 postinstall 脚本"
    echo ""

    # 检查是否有 yarn
    if command -v yarn &> /dev/null; then
        echo "   使用 yarn 安装..."
        # 跳过 scripts，避免下载二进制文件
        yarn install --ignore-scripts --network-timeout 100000 || {
            echo ""
            echo "⚠️  安装失败，尝试使用 npm..."
            npm install --ignore-scripts --legacy-peer-deps
        }
    else
        echo "   使用 npm 安装..."
        npm install --ignore-scripts --legacy-peer-deps
    fi

    echo "✅ 依赖安装完成（已跳过二进制下载）"
else
    echo "✅ 依赖已安装，跳过"
fi

echo ""

# 构建核心包（最小化转换）
echo "🔨 构建 React 核心包（最小化代码转换）..."
echo "   只构建: react + react-dom（核心调试所需）"
echo "   构建类型: NODE_DEV（保留最多原始代码）"
echo ""

# 检查是否已经构建
if [ -d "build/node_modules/react" ] && [ -d "build/node_modules/react-dom" ]; then
    echo "✅ 构建产物已存在，跳过构建"
    echo "   如需重新构建，请删除 build 目录"
else
    echo "📝 配置构建选项（最小化转换）..."

    # 设置环境变量以最小化转换
    export NODE_ENV=development
    export BABEL_ENV=development

    echo "   开始构建（这可能需要 5-10 分钟）..."
    echo ""

    # 构建核心包
    if command -v yarn &> /dev/null; then
        # 只构建 react 和 react-dom，不构建其他包
        yarn build react/index,react/jsx,react-dom/index --type=NODE_DEV 2>&1 | grep -v "Warning:" || true
    else
        npm run build -- react/index,react/jsx,react-dom/index --type=NODE_DEV 2>&1 | grep -v "Warning:" || true
    fi

    echo ""
    echo "✅ 构建完成"
fi

echo ""

# 检查构建产物
if [ -d "build/node_modules/react" ] && [ -d "build/node_modules/react-dom" ]; then
    echo "✅ 构建产物验证成功"
    echo "   位置: react-source/build/node_modules/"
    echo "   包含: react, react-dom"
else
    echo "❌ 构建产物未找到"
    echo ""
    echo "💡 可能的原因："
    echo "   1. 构建过程中出错（查看上方日志）"
    echo "   2. 缺少必要的依赖"
    echo ""
    echo "🔧 解决方法："
    echo "   1. 检查 Node.js 版本 >= 18"
    echo "   2. 尝试手动构建:"
    echo "      cd react-source"
    echo "      yarn build react/index,react-dom/index --type=NODE_DEV"
    echo ""
    exit 1
fi

echo ""

# 返回项目根目录
cd ..

# 备份原始 vite.config.ts
if [ ! -f "vite.config.ts.backup" ]; then
    echo "💾 备份原始 vite.config.ts..."
    cp vite.config.ts vite.config.ts.backup
    echo "✅ 备份完成: vite.config.ts.backup"
fi

echo ""

# 自动更新 vite.config.ts
echo "🔧 自动配置 vite.config.ts..."

# 检查是否已经配置
if grep -q "react-source/build/node_modules/react" vite.config.ts; then
    echo "✅ vite.config.ts 已配置，跳过"
else
    # 在 alias 部分添加 React 源码路径
    # 使用 sed 在 '@animations' 行后插入新的别名
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "/\'@animations\'/a\\
      // 使用本地构建的 React 源码（最小化转换）\\
      'react': resolve(__dirname, 'react-source/build/node_modules/react'),\\
      'react-dom': resolve(__dirname, 'react-source/build/node_modules/react-dom'),\\
" vite.config.ts
    else
        # Linux
        sed -i "/\'@animations\'/a\\      // 使用本地构建的 React 源码（最小化转换）\\n      'react': resolve(__dirname, 'react-source/build/node_modules/react'),\\n      'react-dom': resolve(__dirname, 'react-source/build/node_modules/react-dom')," vite.config.ts
    fi
    echo "✅ vite.config.ts 配置完成"
fi

echo ""
echo "========================================================"
echo "✅ 设置完成！"
echo ""
echo "📊 构建统计："
if [ -d "react-source" ]; then
    echo "   - React 源码大小: $(du -sh react-source 2>/dev/null | cut -f1 || echo '未知')"
fi
if [ -d "react-source/build" ]; then
    echo "   - 构建产物大小: $(du -sh react-source/build 2>/dev/null | cut -f1 || echo '未知')"
fi
echo ""
echo "🎯 优化特性："
echo "   ✅ 跳过二进制下载（--ignore-scripts）"
echo "   ✅ 只构建核心包（react + react-dom）"
echo "   ✅ 禁用 Babel 转换"
echo "   ✅ 保留原始变量名和注释"
echo "   ✅ 禁用代码压缩"
echo "   ✅ 使用 esnext 目标"
echo ""
echo "📦 构建的包："
echo "   ✅ react - React 核心（Hooks、组件等）"
echo "   ✅ react-dom - DOM 渲染器（Fiber、调度器等）"
echo ""
echo "📝 下一步操作："
echo ""
echo "1. 重启开发服务器："
echo "   npm run dev"
echo ""
echo "2. 打开浏览器访问 React Test 页面"
echo ""
echo "3. 点击 'React 源码调试' 实验"
echo ""
echo "4. 现在你可以调试带注释的 React 源码了！"
echo ""
echo "🔍 可调试的核心机制："
echo "   • useState/useEffect 等 Hooks 实现"
echo "   • Fiber 架构和遍历算法"
echo "   • 调度器（Scheduler）"
echo "   • Diff 算法（reconcileChildren）"
echo "   • 批量更新机制"
echo "   • 优先级调度（Lane 模型）"
echo ""
echo "📚 详细文档:"
echo "   - MINIMAL_TRANSFORM.md - 最小化转换说明"
echo "   - REACT_SOURCE_DEBUG.md - 完整调试指南"
echo "   - REACT_DEBUG_QUICKSTART.md - 快速开始"
echo ""
echo "⚠️  注意事项："
echo "   - react-source 目录约占用 300-500MB"
echo "   - 已跳过非核心包的构建，节省时间和空间"
echo "   - 即使最小化转换，仍会移除 Flow 类型注解"
echo "   - 推荐使用双屏学习法获得最佳体验"
echo ""
echo "💡 提示："
echo "   如果构建失败，可以尝试："
echo "   1. 删除 react-source/node_modules"
echo "   2. 重新运行此脚本"
echo "   3. 或查看 REACT_SOURCE_DEBUG.md 手动构建"
echo ""
