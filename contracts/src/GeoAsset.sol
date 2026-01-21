// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GeoAsset
 * @author GeoAsset Protocol
 * @notice 地质资产 NFT 合约
 * @dev 实现 ERC721 + ERC2981 (版税) + AccessControl
 *
 * 资产类型:
 * - 0: Mineral (矿产资源)
 * - 1: Stratum (地层数据)
 * - 2: Fossil (化石记录)
 * - 3: Survey (勘探报告)
 * - 4: Geopark (地质公园)
 * - 5: CarbonSink (碳汇资产)
 */
contract GeoAsset is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC2981,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    // ============================================================
    // Constants & Roles
    // ============================================================

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant COORDINATE_PRECISION = 1_000_000; // 6 decimal places

    // ============================================================
    // Types
    // ============================================================

    enum AssetType {
        Mineral,
        Stratum,
        Fossil,
        Survey,
        Geopark,
        CarbonSink
    }

    struct GeoData {
        AssetType assetType;
        int256 latitude;      // 纬度 * 1e6
        int256 longitude;     // 经度 * 1e6
        uint256 createdAt;
        bool verified;
    }

    // ============================================================
    // State Variables
    // ============================================================

    uint256 private _nextTokenId;

    /// @notice Token ID => GeoData
    mapping(uint256 => GeoData) private _geoData;

    /// @notice 铸造费用 (可选)
    uint256 public mintFee;

    /// @notice 默认版税比例 (basis points, 10000 = 100%)
    uint96 public defaultRoyaltyBps;

    /// @notice 版税接收地址
    address public royaltyReceiver;

    // ============================================================
    // Events
    // ============================================================

    event GeoAssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        AssetType assetType,
        int256 latitude,
        int256 longitude,
        string metadataURI
    );

    event GeoAssetVerified(uint256 indexed tokenId, bool verified);

    event MintFeeUpdated(uint256 oldFee, uint256 newFee);

    event RoyaltyUpdated(address receiver, uint96 bps);

    // ============================================================
    // Errors
    // ============================================================

    error InvalidCoordinates(int256 latitude, int256 longitude);
    error InsufficientPayment(uint256 required, uint256 provided);
    error TokenNotExists(uint256 tokenId);
    error WithdrawFailed();

    // ============================================================
    // Constructor
    // ============================================================

    constructor(
        string memory name_,
        string memory symbol_,
        address defaultAdmin,
        address royaltyReceiver_,
        uint96 royaltyBps_
    ) ERC721(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _grantRole(VERIFIER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);

        royaltyReceiver = royaltyReceiver_;
        defaultRoyaltyBps = royaltyBps_;
        _setDefaultRoyalty(royaltyReceiver_, royaltyBps_);
    }

    // ============================================================
    // External Functions - Minting
    // ============================================================

    /**
     * @notice 铸造地质资产 NFT
     * @param to 接收地址
     * @param assetType 资产类型
     * @param latitude 纬度 (乘以 1e6)
     * @param longitude 经度 (乘以 1e6)
     * @param metadataURI 元数据 URI (IPFS)
     * @return tokenId 新铸造的 Token ID
     */
    function mint(
        address to,
        AssetType assetType,
        int256 latitude,
        int256 longitude,
        string calldata metadataURI
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        // 验证坐标
        if (!_isValidCoordinates(latitude, longitude)) {
            revert InvalidCoordinates(latitude, longitude);
        }

        // 检查铸造费
        if (msg.value < mintFee) {
            revert InsufficientPayment(mintFee, msg.value);
        }

        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _geoData[tokenId] = GeoData({
            assetType: assetType,
            latitude: latitude,
            longitude: longitude,
            createdAt: block.timestamp,
            verified: false
        });

        emit GeoAssetMinted(
            tokenId,
            to,
            assetType,
            latitude,
            longitude,
            metadataURI
        );

        return tokenId;
    }

    /**
     * @notice 批量铸造 (仅限 MINTER_ROLE)
     */
    function mintBatch(
        address to,
        AssetType[] calldata assetTypes,
        int256[] calldata latitudes,
        int256[] calldata longitudes,
        string[] calldata metadataUris
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant returns (uint256[] memory) {
        uint256 length = assetTypes.length;
        require(
            length == latitudes.length &&
            length == longitudes.length &&
            length == metadataUris.length,
            "Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            if (!_isValidCoordinates(latitudes[i], longitudes[i])) {
                revert InvalidCoordinates(latitudes[i], longitudes[i]);
            }

            uint256 tokenId = _nextTokenId++;
            tokenIds[i] = tokenId;

            _safeMint(to, tokenId);
            _setTokenURI(tokenId, metadataUris[i]);

            _geoData[tokenId] = GeoData({
                assetType: assetTypes[i],
                latitude: latitudes[i],
                longitude: longitudes[i],
                createdAt: block.timestamp,
                verified: false
            });

            emit GeoAssetMinted(
                tokenId,
                to,
                assetTypes[i],
                latitudes[i],
                longitudes[i],
                metadataUris[i]
            );
        }

        return tokenIds;
    }

    // ============================================================
    // External Functions - Verification
    // ============================================================

    /**
     * @notice 设置资产验证状态 (仅限 VERIFIER_ROLE)
     */
    function setVerified(
        uint256 tokenId,
        bool verified
    ) external onlyRole(VERIFIER_ROLE) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenNotExists(tokenId);
        }

        _geoData[tokenId].verified = verified;
        emit GeoAssetVerified(tokenId, verified);
    }

    /**
     * @notice 批量设置验证状态
     */
    function setVerifiedBatch(
        uint256[] calldata tokenIds,
        bool verified
    ) external onlyRole(VERIFIER_ROLE) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_ownerOf(tokenIds[i]) == address(0)) {
                revert TokenNotExists(tokenIds[i]);
            }
            _geoData[tokenIds[i]].verified = verified;
            emit GeoAssetVerified(tokenIds[i], verified);
        }
    }

    // ============================================================
    // External Functions - View
    // ============================================================

    /**
     * @notice 获取资产地理数据
     */
    function getGeoData(uint256 tokenId) external view returns (GeoData memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenNotExists(tokenId);
        }
        return _geoData[tokenId];
    }

    /**
     * @notice 获取下一个 Token ID
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    // ============================================================
    // External Functions - Admin
    // ============================================================

    /**
     * @notice 设置铸造费用
     */
    function setMintFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldFee = mintFee;
        mintFee = newFee;
        emit MintFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice 设置默认版税
     */
    function setDefaultRoyalty(
        address receiver,
        uint96 bps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        royaltyReceiver = receiver;
        defaultRoyaltyBps = bps;
        _setDefaultRoyalty(receiver, bps);
        emit RoyaltyUpdated(receiver, bps);
    }

    /**
     * @notice 暂停合约
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice 恢复合约
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice 提取合约余额
     */
    function withdraw(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        (bool success, ) = to.call{value: balance}("");
        if (!success) revert WithdrawFailed();
    }

    // ============================================================
    // Internal Functions
    // ============================================================

    function _isValidCoordinates(
        int256 latitude,
        int256 longitude
    ) internal pure returns (bool) {
        // forge-lint: disable-next-line(unsafe-typecast)
        int256 maxLat = 90 * int256(COORDINATE_PRECISION);
        // forge-lint: disable-next-line(unsafe-typecast)
        int256 maxLon = 180 * int256(COORDINATE_PRECISION);

        return latitude >= -maxLat &&
               latitude <= maxLat &&
               longitude >= -maxLon &&
               longitude <= maxLon;
    }

    // ============================================================
    // Overrides
    // ============================================================

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
