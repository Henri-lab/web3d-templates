# Web3D Templates - GeoAsset Protocol

> 企业级 3D 可视化 + Web3 地质资产数字化平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Go](https://img.shields.io/badge/go-%3E%3D1.21-blue)](https://golang.org/)
[![Solidity](https://img.shields.io/badge/solidity-0.8.20-orange)](https://soliditylang.org/)

---

## 🌟 项目特色

- **🎨 3D 可视化** - Three.js + React Three Fiber 地球可视化
- **⛓️ Web3 集成** - 完整的 NFT + 交易市场 + 链上索引
- **🗺️ 地理资产** - 地质资源数字化与资产化
- **🏢 企业级架构** - 清晰的模块化设计，易于扩展
- **🔒 安全可靠** - OpenZeppelin 标准 + 完整测试覆盖

---

## 📦 包含模块

### 1. 历史故事模块 (module-culture-history)
沉浸式 3D 历史故事学习体验
- 自定义 DSL 语言
- 3D 场景渲染
- 交互式播放

### 2. 地球可视化模块 (module-earth-history)
全球数据可视化展示
- 3D 地球模型
- 数据点标注
- 飞行动画

### 3. **GeoAsset 模块 (module-web3-geo)** ⭐ 新增
地质资源数字化资产平台
- NFT 资产铸造
- 去中心化交易市场
- 3D 地球集成
- 链上索引服务

---

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd web3d-templates

# 一键安装所有依赖
npm run setup
```

### 启动开发环境

```bash
# 启动数据库
npm run db:start

# 启动所有服务 (本地链 + 前端 + 后端)
npm run start:local
```

访问 http://localhost:5173

### 部署到测试网

```bash
# 部署合约到 Base Sepolia
npm run contracts:deploy:sepolia

# 更新配置文件中的合约地址
# 然后启动服务
npm run dev:all
```

详细步骤请查看 [QUICKSTART.md](./QUICKSTART.md)

---

## 📁 项目结构

```
web3d-templates/
├── contracts/              # Solidity 智能合约
│   ├── src/               # 合约源码
│   ├── test/              # 测试用例
│   └── script/            # 部署脚本
│
├── src/
│   ├── modules/
│   │   ├── web3-geo/      # Web3 地质资产模块 ⭐
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── ...
│   ├── components/        # 共享组件
│   ├── pages/            # 页面
│   └── ...
│
├── indexer/              # Go 后端索引服务
│   ├── cmd/
│   ├── internal/
│   └── Dockerfile
│
├── moduleMDs/            # 模块文档
└── package.json          # 完整脚本配置
```

---

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Three.js / React Three Fiber
- wagmi v2 + viem
- Zustand
- Tailwind CSS

### 智能合约
- Solidity 0.8.20
- Foundry
- OpenZeppelin

### 后端
- Go 1.21+
- Fiber
- PostgreSQL
- GORM

### 基础设施
- IPFS (Pinata)
- Base / Arbitrum
- Docker

---

## 📜 可用脚本

### 开发
```bash
npm run dev                    # 启动前端
npm run dev:all                # 启动前端 + 后端
npm run start:local            # 启动本地链 + 前端 + 后端
```

### 合约
```bash
npm run contracts:build        # 编译合约
npm run contracts:test         # 运行测试
npm run contracts:deploy:local # 部署到本地
npm run contracts:deploy:sepolia # 部署到测试网
```

### 后端
```bash
npm run indexer:dev            # 启动索引服务
npm run indexer:build          # 构建二进制
```

### 数据库
```bash
npm run db:start               # 启动 PostgreSQL
npm run db:stop                # 停止数据库
```

---

## 🎯 核心功能

### GeoAsset 模块

#### 资产类型
- 🪨 **Mineral** - 矿产资源
- 🏔️ **Stratum** - 地层数据
- 🦴 **Fossil** - 化石记录
- 📊 **Survey** - 勘探报告
- 🏞️ **Geopark** - 地质公园
- 🌱 **CarbonSink** - 碳汇资产

#### 主要功能
- ✅ NFT 资产铸造
- ✅ 地理坐标存储
- ✅ 资产验证系统
- ✅ 去中心化交易
- ✅ 版税标准 (ERC2981)
- ✅ 3D 地球可视化
- ✅ IPFS 元数据
- ✅ 实时链上索引

---

## 🌐 支持的区块链

| 链 | Chain ID | 状态 |
|----|----------|------|
| Base Sepolia | 84532 | 测试网 ✅ |
| Base | 8453 | 主网 |
| Arbitrum Sepolia | 421614 | 测试网 ✅ |
| Arbitrum One | 42161 | 主网 |
| Ethereum | 1 | 主网 |

---

## 📚 文档

- [快速启动指南](./QUICKSTART.md)
- [项目总结](./PROJECT_SUMMARY.md)
- [GeoAsset 模块文档](./moduleMDs/modules/module-web3-geo/README.md)
- [历史故事模块文档](./moduleMDs/modules/module-culture-history/README.md)
- [地球可视化模块文档](./moduleMDs/modules/module-earth-history/README.md)

---

## 🧪 测试

```bash
# 合约测试
npm run contracts:test

# 前端测试
npm run test

# 测试覆盖率
cd contracts && forge coverage
```

---

## 🔐 安全

- ✅ OpenZeppelin 安全库
- ✅ 访问控制 (AccessControl)
- ✅ 重入攻击防护 (ReentrancyGuard)
- ✅ 暂停功能 (Pausable)
- ✅ 完整测试覆盖

---

## 🤝 贡献

欢迎贡献！请查看贡献指南。

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [OpenZeppelin](https://openzeppelin.com/)
- [Foundry](https://getfoundry.sh/)
- [wagmi](https://wagmi.sh/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

---

## 📞 联系方式

- 文档: 查看 `/moduleMDs/` 目录
- Issues: GitHub Issues
- 讨论: GitHub Discussions

---

**Built with ❤️ for the geological community** 🌍⛏️💎
