# GeoAsset Protocol - Web3 地质资产模块

> 企业级地质资源数字化资产平台

## 模块概述

GeoAsset Protocol 是一个基于区块链的地质资源资产化平台，将地质数据（矿产、地层、化石、勘探报告等）转化为可验证、可交易的数字资产。

### 核心功能

- **资产铸造** - 将地质数据 NFT 化，链上确权
- **交易市场** - 去中心化的地质资产交易平台
- **数据验证** - 第三方认证机构的链上验证
- **3D 可视化** - 与现有 Three.js 模块集成

## 模块信息

| 属性 | 值 |
|------|-----|
| 模块 ID | `web3-geo` |
| 模块名称 | GeoAsset Protocol |
| 版本 | 1.0.0 |
| 类型 | local |
| 命名空间 | `web3-geo` |

## 目录结构

```
├── contracts/                    # Solidity 智能合约
│   ├── src/
│   │   ├── GeoAsset.sol         # 地质资产 NFT (ERC721)
│   │   ├── GeoMarketplace.sol   # 交易市场
│   │   └── GeoRegistry.sol      # 资产注册表
│   ├── script/
│   │   └── Deploy.s.sol         # 部署脚本
│   └── foundry.toml             # Foundry 配置
│
├── src/modules/web3-geo/         # 前端模块
│   ├── components/              # React 组件
│   │   ├── WalletConnect.tsx    # 钱包连接
│   │   ├── GeoAssetCard.tsx     # 资产卡片
│   │   ├── GeoMintForm.tsx      # 铸造表单
│   │   ├── ChainSwitcher.tsx    # 链切换
│   │   └── TransactionStatus.tsx # 交易状态
│   ├── hooks/                   # React Hooks
│   │   ├── useWallet.ts         # 钱包状态
│   │   ├── useGeoAsset.ts       # NFT 合约交互
│   │   └── useGeoMarketplace.ts # 市场合约交互
│   ├── stores/                  # Zustand 状态
│   ├── types/                   # TypeScript 类型
│   ├── utils/                   # 工具函数
│   ├── constants/               # 常量配置
│   └── config/                  # wagmi 配置
│
└── indexer/                      # Go 后端索引服务
    ├── cmd/server/              # 入口
    ├── internal/
    │   ├── api/                 # REST API
    │   ├── chain/               # 链监听
    │   ├── db/                  # 数据库
    │   ├── config/              # 配置
    │   └── models/              # 数据模型
    └── Dockerfile
```

## 技术栈

### 智能合约
- Solidity 0.8.20
- Foundry (编译、测试、部署)
- OpenZeppelin Contracts

### 前端
- React 18 + TypeScript
- wagmi v2 + viem (Web3 交互)
- Zustand (状态管理)
- Three.js (3D 可视化)

### 后端
- Go 1.21+
- Fiber (HTTP 框架)
- GORM (ORM)
- PostgreSQL
- go-ethereum (链交互)

## 支持的链

| 链 | Chain ID | 状态 |
|----|----------|------|
| Base Sepolia | 84532 | 测试网 (默认) |
| Base | 8453 | 主网 |
| Arbitrum Sepolia | 421614 | 测试网 |
| Arbitrum One | 42161 | 主网 |
| Ethereum | 1 | 主网 |

## 快速开始

### 1. 安装依赖

```bash
# 前端依赖
npm install wagmi viem @tanstack/react-query

# 合约依赖 (需要先安装 Foundry)
cd contracts
forge install OpenZeppelin/openzeppelin-contracts

# 后端依赖
cd indexer
go mod download
```

### 2. 配置环境变量

```bash
# 前端 (.env)
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
VITE_ALCHEMY_API_KEY=your_api_key
VITE_INDEXER_URL=http://localhost:8080

# 后端 (indexer/.env)
cp indexer/.env.example indexer/.env
# 编辑 .env 填入数据库和链配置
```

### 3. 部署合约

```bash
cd contracts

# 本地测试
anvil &
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Base Sepolia
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify
```

### 4. 启动后端

```bash
cd indexer

# 启动 PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=geoasset \
  -p 5432:5432 \
  postgres:15

# 启动索引服务
go run cmd/server/main.go
```

### 5. 前端集成

```tsx
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/modules/web3-geo/config/wagmi.config'
import { WalletConnect, GeoMintForm } from '@/modules/web3-geo/components'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletConnect />
        <GeoMintForm />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

## 资产类型

| 类型 | 代码 | 说明 |
|------|------|------|
| Mineral | 0 | 矿产资源 |
| Stratum | 1 | 地层数据 |
| Fossil | 2 | 化石记录 |
| Survey | 3 | 勘探报告 |
| Geopark | 4 | 地质公园 |
| CarbonSink | 5 | 碳汇资产 |

## API 端点

### 资产查询

```
GET /api/v1/assets                    # 获取所有资产
GET /api/v1/assets/:tokenId           # 获取单个资产
GET /api/v1/assets/owner/:address     # 按所有者查询
GET /api/v1/assets/type/:type         # 按类型查询
GET /api/v1/assets/bounds?minLat=&maxLat=&minLng=&maxLng=  # 按地理范围查询
```

### 市场查询

```
GET /api/v1/listings                  # 获取活跃挂单
GET /api/v1/listings/:listingId       # 获取单个挂单
```

### 统计

```
GET /api/v1/stats                     # 获取统计数据
```

## 扩展点

### 1. 新增资产类型

```solidity
// contracts/src/GeoAsset.sol
enum AssetType {
    Mineral,
    Stratum,
    Fossil,
    Survey,
    Geopark,
    CarbonSink,
    // 新增类型
    WaterResource,
    GeothermalEnergy
}
```

### 2. 自定义验证逻辑

```solidity
// contracts/src/GeoRegistry.sol
function registerAuthority(
    bytes32 authorityId,
    string calldata name,
    string calldata standard,  // 自定义认证标准
    address signer
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

### 3. 集成 3D 可视化

```tsx
// 与现有 Earth 模块集成
import { GeoViewer3D } from '@/modules/web3-geo/components'
import { Earth } from '@/components/three/Earth'

function GeoAssetViewer({ asset }) {
  return (
    <Earth>
      <GeoViewer3D
        coordinates={asset.coordinates}
        modelUrl={asset.model3D?.modelCID}
      />
    </Earth>
  )
}
```

## 安全考虑

- 合约使用 OpenZeppelin 安全库
- 支持暂停功能 (Pausable)
- 角色权限控制 (AccessControl)
- 重入攻击防护 (ReentrancyGuard)
- 版税标准 (ERC2981)

## 许可证

MIT License

---

**最后更新**: 2026-01-15
**维护者**: Development Team
