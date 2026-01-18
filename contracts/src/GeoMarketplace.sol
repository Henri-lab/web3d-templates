// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title GeoMarketplace
 * @author GeoAsset Protocol
 * @notice 地质资产交易市场
 * @dev 支持 ETH 和 ERC20 代币支付，自动处理版税
 */
contract GeoMarketplace is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================================
    // Constants & Roles
    // ============================================================

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10%
    uint256 public constant FEE_DENOMINATOR = 10000;

    // ============================================================
    // Types
    // ============================================================

    enum ListingStatus {
        Active,
        Sold,
        Cancelled
    }

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        address currency;       // address(0) = ETH
        uint256 startTime;
        uint256 endTime;
        ListingStatus status;
    }

    // ============================================================
    // State Variables
    // ============================================================

    /// @notice Listing ID => Listing
    mapping(uint256 => Listing) public listings;

    /// @notice 下一个 Listing ID
    uint256 public nextListingId;

    /// @notice 平台费率 (basis points)
    uint256 public platformFee;

    /// @notice 平台费用接收地址
    address public feeReceiver;

    /// @notice 支持的 NFT 合约
    mapping(address => bool) public supportedNFTs;

    /// @notice 支持的支付代币 (address(0) = ETH 始终支持)
    mapping(address => bool) public supportedCurrencies;

    // ============================================================
    // Events
    // ============================================================

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        address currency,
        uint256 endTime
    );

    event ListingSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        uint256 platformFeeAmount,
        uint256 royaltyAmount
    );

    event ListingCancelled(uint256 indexed listingId);

    event ListingPriceUpdated(uint256 indexed listingId, uint256 oldPrice, uint256 newPrice);

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    event NFTSupportUpdated(address indexed nftContract, bool supported);

    event CurrencySupportUpdated(address indexed currency, bool supported);

    // ============================================================
    // Errors
    // ============================================================

    error UnsupportedNFT(address nftContract);
    error UnsupportedCurrency(address currency);
    error InvalidPrice();
    error InvalidDuration();
    error NotSeller();
    error ListingNotActive();
    error ListingExpired();
    error InsufficientPayment(uint256 required, uint256 provided);
    error TransferFailed();
    error FeeTooHigh();

    // ============================================================
    // Constructor
    // ============================================================

    constructor(
        address defaultAdmin,
        address feeReceiver_,
        uint256 platformFee_
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(OPERATOR_ROLE, defaultAdmin);

        feeReceiver = feeReceiver_;
        platformFee = platformFee_;
    }

    // ============================================================
    // External Functions - Listing Management
    // ============================================================

    /**
     * @notice 创建挂单
     * @param nftContract NFT 合约地址
     * @param tokenId Token ID
     * @param price 价格
     * @param currency 支付代币地址 (address(0) = ETH)
     * @param duration 挂单持续时间 (秒)
     */
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address currency,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        // 验证
        if (!supportedNFTs[nftContract]) revert UnsupportedNFT(nftContract);
        if (currency != address(0) && !supportedCurrencies[currency]) {
            revert UnsupportedCurrency(currency);
        }
        if (price == 0) revert InvalidPrice();
        if (duration == 0) revert InvalidDuration();

        // 检查 NFT 所有权和授权
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(tokenId) == address(this),
            "Not approved"
        );

        uint256 listingId = nextListingId++;
        uint256 endTime = block.timestamp + duration;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            currency: currency,
            startTime: block.timestamp,
            endTime: endTime,
            status: ListingStatus.Active
        });

        emit ListingCreated(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            price,
            currency,
            endTime
        );

        return listingId;
    }

    /**
     * @notice 购买挂单
     * @param listingId 挂单 ID
     */
    function buyListing(
        uint256 listingId
    ) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];

        // 验证
        if (listing.status != ListingStatus.Active) revert ListingNotActive();
        if (block.timestamp > listing.endTime) revert ListingExpired();

        // 计算费用
        uint256 price = listing.price;
        uint256 platformFeeAmount = (price * platformFee) / FEE_DENOMINATOR;

        // 获取版税信息
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);

        try IERC2981(listing.nftContract).royaltyInfo(listing.tokenId, price) returns (
            address receiver,
            uint256 amount
        ) {
            royaltyReceiver = receiver;
            royaltyAmount = amount;
        } catch {}

        uint256 sellerAmount = price - platformFeeAmount - royaltyAmount;

        // 处理支付
        if (listing.currency == address(0)) {
            // ETH 支付
            if (msg.value < price) {
                revert InsufficientPayment(price, msg.value);
            }

            // 退还多余的 ETH
            if (msg.value > price) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - price}("");
                if (!refundSuccess) revert TransferFailed();
            }

            // 分配资金
            (bool feeSuccess, ) = feeReceiver.call{value: platformFeeAmount}("");
            if (!feeSuccess) revert TransferFailed();

            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                (bool royaltySuccess, ) = royaltyReceiver.call{value: royaltyAmount}("");
                if (!royaltySuccess) revert TransferFailed();
            }

            (bool sellerSuccess, ) = listing.seller.call{value: sellerAmount}("");
            if (!sellerSuccess) revert TransferFailed();
        } else {
            // ERC20 支付
            IERC20 token = IERC20(listing.currency);

            token.safeTransferFrom(msg.sender, feeReceiver, platformFeeAmount);

            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                token.safeTransferFrom(msg.sender, royaltyReceiver, royaltyAmount);
            }

            token.safeTransferFrom(msg.sender, listing.seller, sellerAmount);
        }

        // 转移 NFT
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // 更新状态
        listing.status = ListingStatus.Sold;

        emit ListingSold(
            listingId,
            msg.sender,
            price,
            platformFeeAmount,
            royaltyAmount
        );
    }

    /**
     * @notice 取消挂单
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];

        if (listing.seller != msg.sender) revert NotSeller();
        if (listing.status != ListingStatus.Active) revert ListingNotActive();

        listing.status = ListingStatus.Cancelled;

        emit ListingCancelled(listingId);
    }

    /**
     * @notice 更新挂单价格
     */
    function updatePrice(uint256 listingId, uint256 newPrice) external nonReentrant {
        Listing storage listing = listings[listingId];

        if (listing.seller != msg.sender) revert NotSeller();
        if (listing.status != ListingStatus.Active) revert ListingNotActive();
        if (newPrice == 0) revert InvalidPrice();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit ListingPriceUpdated(listingId, oldPrice, newPrice);
    }

    // ============================================================
    // External Functions - View
    // ============================================================

    /**
     * @notice 获取活跃挂单列表
     */
    function getActiveListings(
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256[] memory temp = new uint256[](limit);

        for (uint256 i = offset; i < nextListingId && count < limit; i++) {
            if (
                listings[i].status == ListingStatus.Active &&
                block.timestamp <= listings[i].endTime
            ) {
                temp[count++] = i;
            }
        }

        // 裁剪数组
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }

        return result;
    }

    // ============================================================
    // External Functions - Admin
    // ============================================================

    /**
     * @notice 设置平台费率
     */
    function setPlatformFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newFee > MAX_PLATFORM_FEE) revert FeeTooHigh();

        uint256 oldFee = platformFee;
        platformFee = newFee;

        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice 设置费用接收地址
     */
    function setFeeReceiver(address newReceiver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newReceiver != address(0), "Invalid address");
        feeReceiver = newReceiver;
    }

    /**
     * @notice 设置支持的 NFT 合约
     */
    function setSupportedNFT(
        address nftContract,
        bool supported
    ) external onlyRole(OPERATOR_ROLE) {
        supportedNFTs[nftContract] = supported;
        emit NFTSupportUpdated(nftContract, supported);
    }

    /**
     * @notice 设置支持的支付代币
     */
    function setSupportedCurrency(
        address currency,
        bool supported
    ) external onlyRole(OPERATOR_ROLE) {
        supportedCurrencies[currency] = supported;
        emit CurrencySupportUpdated(currency, supported);
    }

    /**
     * @notice 暂停合约
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice 恢复合约
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
