// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/GeoAsset.sol";
import "../src/GeoMarketplace.sol";

contract GeoMarketplaceTest is Test {
    GeoAsset public geoAsset;
    GeoMarketplace public marketplace;

    address public owner = address(1);
    address public seller = address(2);
    address public buyer = address(3);

    uint256 public tokenId;

    function setUp() public {
        // Deploy contracts
        vm.startPrank(owner);
        geoAsset = new GeoAsset("GeoAsset", "GEO", owner, owner, 250);
        marketplace = new GeoMarketplace(owner, owner, 250); // 2.5% platform fee

        // Add GeoAsset to supported NFTs
        marketplace.setSupportedNFT(address(geoAsset), true);
        vm.stopPrank();

        // Mint asset to seller
        vm.prank(seller);
        tokenId = geoAsset.mint(
            seller,
            GeoAsset.AssetType.Mineral,
            39904200,
            116407400,
            "ipfs://QmTest"
        );

        // Approve marketplace
        vm.prank(seller);
        geoAsset.setApprovalForAll(address(marketplace), true);
    }

    // ============================================================
    // Listing Tests
    // ============================================================

    function testCreateListing() public {
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0), // ETH
            7 days
        );

        assertEq(listingId, 0);

        (
            address listingSeller,
            address nftContract,
            uint256 listingTokenId,
            uint256 price,
            ,
            ,
            ,
            GeoMarketplace.ListingStatus status
        ) = marketplace.listings(listingId);

        assertEq(listingSeller, seller);
        assertEq(nftContract, address(geoAsset));
        assertEq(listingTokenId, tokenId);
        assertEq(price, 1 ether);
        assertEq(uint8(status), uint8(GeoMarketplace.ListingStatus.Active));
    }

    function testCreateListingUnsupportedNFT() public {
        // Deploy unsupported NFT
        vm.prank(owner);
        GeoAsset unsupportedNFT = new GeoAsset("Unsupported", "UNS", owner, owner, 0);

        vm.prank(seller);
        vm.expectRevert();
        marketplace.createListing(
            address(unsupportedNFT),
            0,
            1 ether,
            address(0),
            7 days
        );
    }

    function testCreateListingNotOwner() public {
        vm.prank(buyer);
        vm.expectRevert();
        marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );
    }

    // ============================================================
    // Buy Tests
    // ============================================================

    function testBuyListing() public {
        // Create listing
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );

        // Buy
        uint256 sellerBalanceBefore = seller.balance;
        uint256 ownerBalanceBefore = owner.balance;

        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        marketplace.buyListing{value: 1 ether}(listingId);

        // Check NFT transferred
        assertEq(geoAsset.ownerOf(tokenId), buyer);

        // Check payments
        uint256 platformFee = (1 ether * 250) / 10000; // 2.5%
        uint256 royalty = (1 ether * 250) / 10000;     // 2.5%
        uint256 sellerAmount = 1 ether - platformFee - royalty;

        assertEq(seller.balance, sellerBalanceBefore + sellerAmount);
        assertEq(owner.balance, ownerBalanceBefore + platformFee + royalty);

        // Check listing status
        (,,,,,, GeoMarketplace.ListingStatus status) = marketplace.listings(listingId);
        assertEq(uint8(status), uint8(GeoMarketplace.ListingStatus.Sold));
    }

    function testBuyListingInsufficientPayment() public {
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );

        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        vm.expectRevert();
        marketplace.buyListing{value: 0.5 ether}(listingId);
    }

    function testBuyExpiredListing() public {
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            1 days
        );

        // Fast forward past expiry
        vm.warp(block.timestamp + 2 days);

        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        vm.expectRevert();
        marketplace.buyListing{value: 1 ether}(listingId);
    }

    // ============================================================
    // Cancel Tests
    // ============================================================

    function testCancelListing() public {
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );

        vm.prank(seller);
        marketplace.cancelListing(listingId);

        (,,,,,, GeoMarketplace.ListingStatus status) = marketplace.listings(listingId);
        assertEq(uint8(status), uint8(GeoMarketplace.ListingStatus.Cancelled));
    }

    function testCancelListingNotSeller() public {
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );

        vm.prank(buyer);
        vm.expectRevert();
        marketplace.cancelListing(listingId);
    }

    // ============================================================
    // Update Price Tests
    // ============================================================

    function testUpdatePrice() public {
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );

        vm.prank(seller);
        marketplace.updatePrice(listingId, 2 ether);

        (,,, uint256 price,,,,) = marketplace.listings(listingId);
        assertEq(price, 2 ether);
    }

    function testUpdatePriceNotSeller() public {
        vm.prank(seller);
        uint256 listingId = marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );

        vm.prank(buyer);
        vm.expectRevert();
        marketplace.updatePrice(listingId, 2 ether);
    }

    // ============================================================
    // Admin Tests
    // ============================================================

    function testSetPlatformFee() public {
        vm.prank(owner);
        marketplace.setPlatformFee(500); // 5%

        assertEq(marketplace.platformFee(), 500);
    }

    function testSetPlatformFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert();
        marketplace.setPlatformFee(1001); // > 10%
    }

    function testPause() public {
        vm.prank(owner);
        marketplace.pause();

        vm.prank(seller);
        vm.expectRevert();
        marketplace.createListing(
            address(geoAsset),
            tokenId,
            1 ether,
            address(0),
            7 days
        );
    }

    // ============================================================
    // View Tests
    // ============================================================

    function testGetActiveListings() public {
        // Create multiple listings
        for (uint256 i = 0; i < 3; i++) {
            vm.prank(seller);
            uint256 newTokenId = geoAsset.mint(
                seller,
                GeoAsset.AssetType.Mineral,
                39904200 + int256(i * 1000000),
                116407400,
                "ipfs://QmTest"
            );

            vm.prank(seller);
            marketplace.createListing(
                address(geoAsset),
                newTokenId,
                1 ether,
                address(0),
                7 days
            );
        }

        uint256[] memory activeListings = marketplace.getActiveListings(0, 10);
        assertEq(activeListings.length, 3);
    }
}
