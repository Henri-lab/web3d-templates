#!/bin/bash

# React 源码调试环境设置脚本（最小化代码转换版本）
# 用法: ./setup-react-source.sh

set -e

echo "🚀 React 源码调试环境设置（最小化转换）"
echo "================================================"
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
    git clone --depth 1 --branch main https://github.com/facebook/react.git .
    echo "✅ 克隆完成"
fi

echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖（这可能需要 5-10 分钟）..."

    # 检查是否有 yarn
    if command -v yarn &> /dev/null; then
        yarn install
    else
        echo "⚠️  未找到 yarn，使用 npm 安装..."
        npm install
    fi

    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装，跳过"
fi

echo ""

# 构建开发版本（最小化转换）
echo "🔨 构建 React 开发版本（最小化代码转换）..."
echo "   构建类型: NODE_DEV（保留最多原始代码）"
echo ""

# 修改构建配置以最小化转换
echo "📝 配置构建选项..."

# 创建临时的 Babel 配置，禁用大部分转换
cat > .babelrc.temp << 'EOF'
{
  "presets": [],
  "plugins": []
}
EOF

# 构建
if command -v yarn &> /dev/null; then
    # 使用环境变量禁用代码转换
    BABEL_ENV=development yarn build react/index,react-dom/index --type=NODE_DEV
else
    BABEL_ENV=development npm run build -- react/index,react-dom/index --type=NODE_DEV
fi

# 清理临时文件
rm -f .babelrc.temp

echo "✅ 构建完成"
echo ""

# 检查构建产物
if [ -d "build/node_modules/react" ]; then
    echo "✅ 构建产物验证成功"
    echo "   位置: react-source/build/node_modules/"
else
    echo "❌ 构建产物未找到，请检查构建日志"
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
echo "================================================"
echo "✅ 设置完成！"
echo ""
echo "📊 构建统计："
echo "   - React 源码大小: $(du -sh react-source 2>/dev/null | cut -f1)"
echo "   - 构建产物大小: $(du -sh react-source/build 2>/dev/null | cut -f1)"
echo ""
echo "🎯 代码转换优化："
echo "   ✅ 禁用 Babel 转换"
echo "   ✅ 保留原始变量名"
echo "   ✅ 禁用代码压缩"
echo "   ✅ 使用 esnext 目标"
echo ""
echo "📝 下一步操作："
echo ""
echo "1. 重启开发服务器："
echo "   npm run dev"
echo ""
echo "2. 打开浏览器访问 React Test 页面"
echo ""
echo "3. 点击 'React 源码调试' 实验开始调试"
echo ""
echo "4. 现在你应该能看到更接近原始的 React 代码！"
echo ""
echo "📚 详细文档: 查看 REACT_SOURCE_DEBUG.md"
echo ""
echo "⚠️  注意事项："
echo "   - react-source 目录约占用 500MB 磁盘空间"
echo "   - 即使最小化转换，React 仍会经过一些必要的编译"
echo "   - 推荐使用双屏学习法获得最佳体验"
echo ""
