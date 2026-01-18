// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GeoAsset.sol";
import "../src/GeoMarketplace.sol";
import "../src/GeoRegistry.sol";

/**
 * @title DeployGeoProtocol
 * @notice 部署脚本 - GeoAsset Protocol 全套合约
 *
 * 使用方法:
 * ```bash
 * # 本地测试
 * forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
 *
 * # Base Sepolia 测试网
 * forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
 *
 * # Base 主网
 * forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --verify
 * ```
 */
contract DeployGeoProtocol is Script {
    // 部署参数
    string public constant NFT_NAME = "GeoAsset";
    string public constant NFT_SYMBOL = "GEO";
    uint96 public constant DEFAULT_ROYALTY_BPS = 250; // 2.5%
    uint256 public constant PLATFORM_FEE_BPS = 250;   // 2.5%

    // 部署结果
    GeoAsset public geoAsset;
    GeoMarketplace public geoMarketplace;
    GeoRegistry public geoRegistry;

    function run() external {
        // 从环境变量获取部署者私钥
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署 GeoAsset NFT
        geoAsset = new GeoAsset(
            NFT_NAME,
            NFT_SYMBOL,
            deployer,           // admin
            deployer,           // royalty receiver
            DEFAULT_ROYALTY_BPS
        );
        console.log("GeoAsset deployed:", address(geoAsset));

        // 2. 部署 GeoMarketplace
        geoMarketplace = new GeoMarketplace(
            deployer,           // admin
            deployer,           // fee receiver
            PLATFORM_FEE_BPS
        );
        console.log("GeoMarketplace deployed:", address(geoMarketplace));

        // 3. 部署 GeoRegistry
        geoRegistry = new GeoRegistry(deployer);
        console.log("GeoRegistry deployed:", address(geoRegistry));

        // 4. 配置 Marketplace 支持 GeoAsset
        geoMarketplace.setSupportedNFT(address(geoAsset), true);
        console.log("GeoAsset added to Marketplace");

        // 5. 授予 Registry 的 REGISTRAR_ROLE 给 GeoAsset (可选，用于自动注册)
        // geoRegistry.grantRole(geoRegistry.REGISTRAR_ROLE(), address(geoAsset));

        vm.stopBroadcast();

        // 输出部署结果
        console.log("\n========== Deployment Complete ==========");
        console.log("GeoAsset:       ", address(geoAsset));
        console.log("GeoMarketplace: ", address(geoMarketplace));
        console.log("GeoRegistry:    ", address(geoRegistry));
        console.log("==========================================\n");

        // 写入部署地址到文件 (可选)
        _writeDeploymentInfo();
    }

    function _writeDeploymentInfo() internal {
        string memory chainId = vm.toString(block.chainid);
        string memory json = string(abi.encodePacked(
            '{"chainId":', chainId,
            ',"geoAsset":"', vm.toString(address(geoAsset)),
            '","geoMarketplace":"', vm.toString(address(geoMarketplace)),
            '","geoRegistry":"', vm.toString(address(geoRegistry)),
            '","deployedAt":', vm.toString(block.timestamp),
            '}'
        ));

        string memory filename = string(abi.encodePacked(
            "deployments/",
            chainId,
            ".json"
        ));

        vm.writeFile(filename, json);
        console.log("Deployment info written to:", filename);
    }
}

/**
 * @title DeployGeoAssetOnly
 * @notice 仅部署 GeoAsset NFT 合约
 */
contract DeployGeoAssetOnly is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        GeoAsset geoAsset = new GeoAsset(
            "GeoAsset",
            "GEO",
            deployer,
            deployer,
            250 // 2.5% royalty
        );

        vm.stopBroadcast();

        console.log("GeoAsset deployed:", address(geoAsset));
    }
}
