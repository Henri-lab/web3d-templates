// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title GeoRegistry
 * @author GeoAsset Protocol
 * @notice 地质资产注册表 - 链上索引和查询
 * @dev 提供按地理位置、类型等维度的资产索引
 *
 * 扩展点:
 * - 空间索引 (Geohash)
 * - 资产关联 (父子关系)
 * - 认证机构注册
 * - 数据源验证
 */
contract GeoRegistry is AccessControl, Pausable {
    // ============================================================
    // Constants & Roles
    // ============================================================

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    // Geohash 精度级别
    uint8 public constant GEOHASH_PRECISION = 6; // ~1.2km x 0.6km

    // ============================================================
    // Types
    // ============================================================

    struct AssetRecord {
        address nftContract;
        uint256 tokenId;
        uint8 assetType;
        bytes6 geohash;         // 6 字符 geohash
        uint256 registeredAt;
        bool active;
    }

    struct CertificationAuthority {
        string name;
        string standard;        // JORC, NI43-101, etc.
        address signer;
        bool active;
    }

    // ============================================================
    // State Variables
    // ============================================================

    /// @notice 资产记录 (nftContract => tokenId => AssetRecord)
    mapping(address => mapping(uint256 => AssetRecord)) public assetRecords;

    /// @notice Geohash 索引 (geohash => asset keys)
    mapping(bytes6 => bytes32[]) private _geohashIndex;

    /// @notice 类型索引 (assetType => asset keys)
    mapping(uint8 => bytes32[]) private _typeIndex;

    /// @notice 认证机构 (authorityId => CertificationAuthority)
    mapping(bytes32 => CertificationAuthority) public certificationAuthorities;

    /// @notice 资产认证 (assetKey => authorityId => certified)
    mapping(bytes32 => mapping(bytes32 => bool)) public assetCertifications;

    /// @notice 总注册资产数
    uint256 public totalRegistered;

    // ============================================================
    // Events
    // ============================================================

    event AssetRegistered(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint8 assetType,
        bytes6 geohash
    );

    event AssetDeregistered(
        address indexed nftContract,
        uint256 indexed tokenId
    );

    event AuthorityRegistered(
        bytes32 indexed authorityId,
        string name,
        string standard
    );

    event AssetCertified(
        address indexed nftContract,
        uint256 indexed tokenId,
        bytes32 indexed authorityId
    );

    // ============================================================
    // Errors
    // ============================================================

    error AssetAlreadyRegistered();
    error AssetNotRegistered();
    error InvalidGeohash();
    error AuthorityNotActive();

    // ============================================================
    // Constructor
    // ============================================================

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(REGISTRAR_ROLE, defaultAdmin);
    }

    // ============================================================
    // External Functions - Registration
    // ============================================================

    /**
     * @notice 注册资产到索引
     */
    function registerAsset(
        address nftContract,
        uint256 tokenId,
        uint8 assetType,
        bytes6 geohash
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused {
        if (assetRecords[nftContract][tokenId].active) {
            revert AssetAlreadyRegistered();
        }
        if (!_isValidGeohash(geohash)) {
            revert InvalidGeohash();
        }

        bytes32 assetKey = _getAssetKey(nftContract, tokenId);

        assetRecords[nftContract][tokenId] = AssetRecord({
            nftContract: nftContract,
            tokenId: tokenId,
            assetType: assetType,
            geohash: geohash,
            registeredAt: block.timestamp,
            active: true
        });

        _geohashIndex[geohash].push(assetKey);
        _typeIndex[assetType].push(assetKey);
        totalRegistered++;

        emit AssetRegistered(nftContract, tokenId, assetType, geohash);
    }

    /**
     * @notice 批量注册资产
     */
    function registerAssetBatch(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        uint8[] calldata assetTypes,
        bytes6[] calldata geohashes
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused {
        uint256 length = nftContracts.length;
        require(
            length == tokenIds.length &&
            length == assetTypes.length &&
            length == geohashes.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < length; i++) {
            if (assetRecords[nftContracts[i]][tokenIds[i]].active) continue;
            if (!_isValidGeohash(geohashes[i])) continue;

            bytes32 assetKey = _getAssetKey(nftContracts[i], tokenIds[i]);

            assetRecords[nftContracts[i]][tokenIds[i]] = AssetRecord({
                nftContract: nftContracts[i],
                tokenId: tokenIds[i],
                assetType: assetTypes[i],
                geohash: geohashes[i],
                registeredAt: block.timestamp,
                active: true
            });

            _geohashIndex[geohashes[i]].push(assetKey);
            _typeIndex[assetTypes[i]].push(assetKey);
            totalRegistered++;

            emit AssetRegistered(nftContracts[i], tokenIds[i], assetTypes[i], geohashes[i]);
        }
    }

    /**
     * @notice 注销资产
     */
    function deregisterAsset(
        address nftContract,
        uint256 tokenId
    ) external onlyRole(REGISTRAR_ROLE) {
        if (!assetRecords[nftContract][tokenId].active) {
            revert AssetNotRegistered();
        }

        assetRecords[nftContract][tokenId].active = false;
        totalRegistered--;

        emit AssetDeregistered(nftContract, tokenId);
    }

    // ============================================================
    // External Functions - Certification
    // ============================================================

    /**
     * @notice 注册认证机构
     */
    function registerAuthority(
        bytes32 authorityId,
        string calldata name,
        string calldata standard,
        address signer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        certificationAuthorities[authorityId] = CertificationAuthority({
            name: name,
            standard: standard,
            signer: signer,
            active: true
        });

        emit AuthorityRegistered(authorityId, name, standard);
    }

    /**
     * @notice 认证资产
     */
    function certifyAsset(
        address nftContract,
        uint256 tokenId,
        bytes32 authorityId
    ) external {
        CertificationAuthority storage authority = certificationAuthorities[authorityId];
        if (!authority.active) revert AuthorityNotActive();
        require(msg.sender == authority.signer, "Not authorized signer");

        if (!assetRecords[nftContract][tokenId].active) {
            revert AssetNotRegistered();
        }

        bytes32 assetKey = _getAssetKey(nftContract, tokenId);
        assetCertifications[assetKey][authorityId] = true;

        emit AssetCertified(nftContract, tokenId, authorityId);
    }

    // ============================================================
    // External Functions - Query
    // ============================================================

    /**
     * @notice 按 Geohash 查询资产
     */
    function getAssetsByGeohash(
        bytes6 geohash
    ) external view returns (bytes32[] memory) {
        return _geohashIndex[geohash];
    }

    /**
     * @notice 按类型查询资产
     */
    function getAssetsByType(
        uint8 assetType
    ) external view returns (bytes32[] memory) {
        return _typeIndex[assetType];
    }

    /**
     * @notice 检查资产是否已认证
     */
    function isAssetCertified(
        address nftContract,
        uint256 tokenId,
        bytes32 authorityId
    ) external view returns (bool) {
        bytes32 assetKey = _getAssetKey(nftContract, tokenId);
        return assetCertifications[assetKey][authorityId];
    }

    /**
     * @notice 解析资产 Key
     */
    function parseAssetKey(
        bytes32 assetKey
    ) external pure returns (address nftContract, uint256 tokenId) {
        nftContract = address(uint160(uint256(assetKey) >> 96));
        tokenId = uint256(uint96(uint256(assetKey)));
    }

    // ============================================================
    // External Functions - Admin
    // ============================================================

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ============================================================
    // Internal Functions
    // ============================================================

    function _getAssetKey(
        address nftContract,
        uint256 tokenId
    ) internal pure returns (bytes32) {
        // forge-lint: disable-next-line(unsafe-typecast)
        return bytes32((uint256(uint160(nftContract)) << 96) | uint96(tokenId));
    }

    function _isValidGeohash(bytes6 geohash) internal pure returns (bool) {
        // 验证 geohash 字符 (base32: 0-9, b-h, j-n, p, q-z)
        for (uint8 i = 0; i < 6; i++) {
            bytes1 c = geohash[i];
            if (
                !(c >= 0x30 && c <= 0x39) && // 0-9
                !(c >= 0x62 && c <= 0x68) && // b-h
                !(c >= 0x6a && c <= 0x6e) && // j-n
                !(c == 0x70) &&              // p
                !(c >= 0x71 && c <= 0x7a)    // q-z
            ) {
                return false;
            }
        }
        return true;
    }
}
