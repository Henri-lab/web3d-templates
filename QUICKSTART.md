# GeoAsset Protocol - 快速启动指南

## 项目概述

GeoAsset Protocol 是一个企业级的地质资源数字化资产平台，包含：
- **智能合约** (Solidity + Foundry)
- **前端应用** (React + TypeScript + wagmi)
- **后端索引** (Go + PostgreSQL)
- **3D 可视化** (Three.js 集成)

---

## 前置要求

### 必需
- Node.js >= 18.0.0
- Go >= 1.21
- PostgreSQL >= 15
- Foundry (Solidity 工具链)

### 可选
- Docker (用于数据库)
- Pinata 账号 (IPFS 上传)

---

## 安装步骤

### 1. 安装 Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. 安装项目依赖

```bash
# 安装所有依赖 (前端 + 合约 + 后端)
npm run setup

# 或者分别安装
npm install                          # 前端
cd contracts && forge install        # 合约

forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts

cd indexer && go mod download        # 后端
```

---

## 配置环境变量

### 前端 (.env)

```bash
# 复制示例文件
cp src/modules/web3-geo/.env.example .env

# 编辑 .env
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id  # 从 https://cloud.walletconnect.com 获取
VITE_ALCHEMY_API_KEY=your_api_key              # 可选
VITE_INDEXER_URL=http://localhost:8080
VITE_PINATA_API_KEY=your_pinata_key            # 从 https://pinata.cloud 获取
VITE_PINATA_SECRET_KEY=your_pinata_secret
```

### 后端 (indexer/.env)

```bash
# 复制示例文件
cp indexer/.env.example indexer/.env

# 编辑 indexer/.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=geoasset

CHAIN_RPC_URL=https://sepolia.base.org
CHAIN_ID=84532
GEOASSET_ADDRESS=0x...        # 部署后填入
MARKETPLACE_ADDRESS=0x...     # 部署后填入
```

### 合约 (contracts/.env)

```bash
# 创建 contracts/.env
cd contracts
cat >| .env << EOF
PRIVATE_KEY=0x...                    # 部署者私钥
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_api_key       # 用于验证合约
EOF
```

---

## 启动开发环境

### 方式 1: 一键启动所有服务

```bash
# 启动数据库
npm run db:start

# 启动本地链 + 前端 + 后端 (并行)
npm run start:local
```

### 方式 2: 分别启动

```bash
# 终端 1: 启动本地区块链 (Anvil)
npm run contracts:anvil

# 终端 2: 部署合约到本地链
npm run contracts:deploy:local

# 终端 3: 启动数据库
npm run db:start

# 终端 4: 启动后端索引服务
npm run indexer:dev

# 终端 5: 启动前端
npm run dev:frontend
```

---

## 部署到测试网

### 1. 部署合约到 Base Sepolia

```bash
cd contracts

# 确保 .env 中有 PRIVATE_KEY 和 BASE_SEPOLIA_RPC_URL
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify

# 记录输出的合约地址
# GeoAsset:       0x...
# GeoMarketplace: 0x...
# GeoRegistry:    0x...
```

### 2. 更新配置

将部署的合约地址填入：
- `src/modules/web3-geo/constants/index.ts` (前端)
- `indexer/.env` (后端)

### 3. 启动服务

```bash
# 启动后端
npm run indexer:dev

# 启动前端
npm run dev:frontend
```

---

## 测试

### 合约测试

```bash
cd contracts

# 运行所有测试
npm run contracts:test

# 或使用 forge 直接运行
forge test -vvv

# 测试覆盖率
forge coverage
```

### 前端测试

```bash
npm run test
```

---

## 可用脚本

### 前端
```bash
npm run dev                    # 启动开发服务器
npm run build                  # 构建生产版本
npm run preview                # 预览生产构建
```

### 合约
```bash
npm run contracts:build        # 编译合约
npm run contracts:test         # 运行测试
npm run contracts:deploy:local # 部署到本地
npm run contracts:deploy:sepolia # 部署到 Base Sepolia
npm run contracts:anvil        # 启动本地链
```

### 后端
```bash
npm run indexer:dev            # 启动开发服务器
npm run indexer:build          # 构建二进制
npm run indexer:docker         # 构建 Docker 镜像
```

### 数据库
```bash
npm run db:start               # 启动 PostgreSQL (Docker)
npm run db:stop                # 停止数据库
```

### 组合命令
```bash
npm run dev:all                # 并行启动前端 + 后端
npm run start:local            # 启动本地链 + 前端 + 后端
npm run setup                  # 安装所有依赖
```

---

## 访问应用

启动后访问：

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:8080
- **区块链浏览器**: https://sepolia.basescan.org

### 主要页面

- `/geo` - 资产浏览器
- `/geo/3d` - 3D 地球视图
- `/geo/marketplace` - 交易市场
- `/geo/my-assets` - 我的资产
- `/geo/mint` - 铸造新资产

---

## 常见问题

### 1. 合约部署失败

**问题**: `Error: insufficient funds`

**解决**:
- 确保部署账户有足够的测试币
- Base Sepolia 水龙头: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### 2. 后端连接失败

**问题**: `Failed to connect to database`

**解决**:
```bash
# 检查数据库是否运行
docker ps | grep postgres

# 重启数据库
npm run db:stop
npm run db:start
```

### 3. 前端钱包连接失败

**问题**: `WalletConnect project ID not configured`

**解决**:
- 访问 https://cloud.walletconnect.com
- 创建项目获取 Project ID
- 添加到 `.env` 文件

### 4. IPFS 上传失败

**问题**: `Pinata API keys not configured`

**解决**:
- 访问 https://pinata.cloud
- 获取 API Key 和 Secret
- 添加到 `.env` 文件

---

## 生产部署

### 前端 (Vercel/Netlify)

```bash
npm run build
# 部署 dist/ 目录
```

### 后端 (Docker)

```bash
cd indexer
docker build -t geoasset-indexer .
docker run -p 8080:8080 --env-file .env geoasset-indexer
```

### 数据库 (托管服务)

推荐使用:
- Supabase
- Railway
- Render

---

## 下一步

1. **配置认证机构** - 在 GeoRegistry 合约中注册认证机构
2. **上传测试数据** - 铸造一些测试资产
3. **自定义主题** - 修改 Tailwind 配置
4. **添加更多资产类型** - 扩展 AssetType 枚举
5. **集成更多链** - 添加到 CHAIN_CONFIGS

---

## 技术支持

- 文档: `/moduleMDs/modules/module-web3-geo/README.md`
- 合约文档: `/contracts/src/`
- API 文档: 访问 http://localhost:8080/api/v1/

---

**祝你使用愉快！** 🚀
