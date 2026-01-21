// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {GeoAsset} from "../src/GeoAsset.sol";

contract GeoAssetTest is Test {
    GeoAsset public geoAsset;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    // Test data
    int256 constant LATITUDE = 39904200;  // 39.9042 * 1e6
    int256 constant LONGITUDE = 116407400; // 116.4074 * 1e6
    string constant METADATA_URI = "ipfs://QmTest123";

    function setUp() public {
        vm.startPrank(owner);
        geoAsset = new GeoAsset(
            "GeoAsset",
            "GEO",
            owner,
            owner,
            250 // 2.5% royalty
        );
        vm.stopPrank();
    }

    // ============================================================
    // Minting Tests
    // ============================================================

    function testMint() public {
        vm.prank(user1);
        uint256 tokenId = geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        assertEq(tokenId, 0);
        assertEq(geoAsset.ownerOf(tokenId), user1);
        assertEq(geoAsset.tokenURI(tokenId), METADATA_URI);
    }

    function testMintWithFee() public {
        // Set mint fee
        vm.prank(owner);
        geoAsset.setMintFee(0.01 ether);

        // Mint should fail without fee
        vm.prank(user1);
        vm.expectRevert();
        geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        // Mint should succeed with fee
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        uint256 tokenId = geoAsset.mint{value: 0.01 ether}(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        assertEq(tokenId, 0);
        assertEq(address(geoAsset).balance, 0.01 ether);
    }

    function testMintInvalidCoordinates() public {
        vm.prank(user1);
        vm.expectRevert();
        geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            91_000_000, // Invalid latitude > 90
            LONGITUDE,
            METADATA_URI
        );
    }

    function testMintBatch() public {
        GeoAsset.AssetType[] memory types = new GeoAsset.AssetType[](3);
        types[0] = GeoAsset.AssetType.Mineral;
        types[1] = GeoAsset.AssetType.Stratum;
        types[2] = GeoAsset.AssetType.Fossil;

        int256[] memory lats = new int256[](3);
        lats[0] = LATITUDE;
        lats[1] = LATITUDE + 1000000;
        lats[2] = LATITUDE + 2000000;

        int256[] memory lngs = new int256[](3);
        lngs[0] = LONGITUDE;
        lngs[1] = LONGITUDE + 1000000;
        lngs[2] = LONGITUDE + 2000000;

        string[] memory uris = new string[](3);
        uris[0] = "ipfs://QmTest1";
        uris[1] = "ipfs://QmTest2";
        uris[2] = "ipfs://QmTest3";

        vm.prank(owner);
        uint256[] memory tokenIds = geoAsset.mintBatch(
            user1,
            types,
            lats,
            lngs,
            uris
        );

        assertEq(tokenIds.length, 3);
        assertEq(geoAsset.balanceOf(user1), 3);
    }

    // ============================================================
    // Verification Tests
    // ============================================================

    function testSetVerified() public {
        // Mint asset
        vm.prank(user1);
        uint256 tokenId = geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        // Check initial state
        GeoAsset.GeoData memory data = geoAsset.getGeoData(tokenId);
        assertFalse(data.verified);

        // Set verified (only verifier role)
        vm.prank(owner);
        geoAsset.setVerified(tokenId, true);

        data = geoAsset.getGeoData(tokenId);
        assertTrue(data.verified);
    }

    function testSetVerifiedUnauthorized() public {
        vm.prank(user1);
        uint256 tokenId = geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        // Non-verifier should fail
        vm.prank(user2);
        vm.expectRevert();
        geoAsset.setVerified(tokenId, true);
    }

    // ============================================================
    // Transfer Tests
    // ============================================================

    function testTransfer() public {
        vm.prank(user1);
        uint256 tokenId = geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        vm.prank(user1);
        geoAsset.transferFrom(user1, user2, tokenId);

        assertEq(geoAsset.ownerOf(tokenId), user2);
    }

    // ============================================================
    // Royalty Tests
    // ============================================================

    function testRoyaltyInfo() public {
        vm.prank(user1);
        uint256 tokenId = geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        (address receiver, uint256 royaltyAmount) = geoAsset.royaltyInfo(
            tokenId,
            1 ether
        );

        assertEq(receiver, owner);
        assertEq(royaltyAmount, 0.025 ether); // 2.5%
    }

    function testSetDefaultRoyalty() public {
        vm.prank(owner);
        geoAsset.setDefaultRoyalty(user1, 500); // 5%

        vm.prank(user2);
        uint256 tokenId = geoAsset.mint(
            user2,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        (address receiver, uint256 royaltyAmount) = geoAsset.royaltyInfo(
            tokenId,
            1 ether
        );

        assertEq(receiver, user1);
        assertEq(royaltyAmount, 0.05 ether); // 5%
    }

    // ============================================================
    // Admin Tests
    // ============================================================

    function testPause() public {
        vm.prank(owner);
        geoAsset.pause();

        vm.prank(user1);
        vm.expectRevert();
        geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );
    }

    function testUnpause() public {
        vm.prank(owner);
        geoAsset.pause();

        vm.prank(owner);
        geoAsset.unpause();

        vm.prank(user1);
        uint256 tokenId = geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        assertEq(tokenId, 0);
    }

    function testWithdraw() public {
        // Set mint fee and mint
        vm.prank(owner);
        geoAsset.setMintFee(0.1 ether);

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        geoAsset.mint{value: 0.1 ether}(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        assertEq(address(geoAsset).balance, 0.1 ether);

        // Withdraw
        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        geoAsset.withdraw(owner);

        assertEq(address(geoAsset).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + 0.1 ether);
    }

    // ============================================================
    // View Tests
    // ============================================================

    function testGetGeoData() public {
        vm.prank(user1);
        uint256 tokenId = geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        GeoAsset.GeoData memory data = geoAsset.getGeoData(tokenId);

        assertEq(uint8(data.assetType), uint8(GeoAsset.AssetType.Mineral));
        assertEq(data.latitude, LATITUDE);
        assertEq(data.longitude, LONGITUDE);
        assertFalse(data.verified);
    }

    function testTotalSupply() public {
        assertEq(geoAsset.totalSupply(), 0);

        vm.prank(user1);
        geoAsset.mint(
            user1,
            GeoAsset.AssetType.Mineral,
            LATITUDE,
            LONGITUDE,
            METADATA_URI
        );

        assertEq(geoAsset.totalSupply(), 1);
    }
}
