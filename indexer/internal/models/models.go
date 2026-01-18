package models

import (
	"time"

	"gorm.io/gorm"
)

// GeoAsset represents a geological asset NFT
type GeoAsset struct {
	gorm.Model
	TokenID     uint64  `gorm:"uniqueIndex;not null" json:"token_id"`
	Owner       string  `gorm:"index;size:42;not null" json:"owner"`
	AssetType   uint8   `gorm:"index;not null" json:"asset_type"`
	Latitude    int64   `json:"latitude"`   // Scaled by 1e6
	Longitude   int64   `json:"longitude"`  // Scaled by 1e6
	MetadataURI string  `gorm:"size:500" json:"metadata_uri"`
	Verified    bool    `gorm:"default:false" json:"verified"`
	MintedAt    time.Time `json:"minted_at"`
	MintTxHash  string  `gorm:"size:66" json:"mint_tx_hash"`
	BlockNumber uint64  `json:"block_number"`
}

// GeoAssetMetadata represents cached metadata from IPFS
type GeoAssetMetadata struct {
	gorm.Model
	TokenID     uint64 `gorm:"uniqueIndex;not null" json:"token_id"`
	Name        string `gorm:"size:255" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	Image       string `gorm:"size:500" json:"image"`
	RawJSON     string `gorm:"type:jsonb" json:"raw_json"`
	FetchedAt   time.Time `json:"fetched_at"`
}

// Listing represents a marketplace listing
type Listing struct {
	gorm.Model
	ListingID   uint64    `gorm:"uniqueIndex;not null" json:"listing_id"`
	TokenID     uint64    `gorm:"index;not null" json:"token_id"`
	Seller      string    `gorm:"index;size:42;not null" json:"seller"`
	Price       string    `gorm:"size:78;not null" json:"price"` // Store as string for big numbers
	Currency    string    `gorm:"size:42;not null" json:"currency"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	Status      uint8     `gorm:"index;default:0" json:"status"` // 0: Active, 1: Sold, 2: Cancelled
	CreateTxHash string   `gorm:"size:66" json:"create_tx_hash"`
	BlockNumber uint64    `json:"block_number"`
}

// Transfer represents an NFT transfer event
type Transfer struct {
	gorm.Model
	TokenID     uint64    `gorm:"index;not null" json:"token_id"`
	From        string    `gorm:"index;size:42;not null" json:"from"`
	To          string    `gorm:"index;size:42;not null" json:"to"`
	TxHash      string    `gorm:"size:66;not null" json:"tx_hash"`
	BlockNumber uint64    `json:"block_number"`
	Timestamp   time.Time `json:"timestamp"`
}

// Sale represents a marketplace sale event
type Sale struct {
	gorm.Model
	ListingID   uint64    `gorm:"index;not null" json:"listing_id"`
	TokenID     uint64    `gorm:"index;not null" json:"token_id"`
	Seller      string    `gorm:"index;size:42;not null" json:"seller"`
	Buyer       string    `gorm:"index;size:42;not null" json:"buyer"`
	Price       string    `gorm:"size:78;not null" json:"price"`
	PlatformFee string    `gorm:"size:78" json:"platform_fee"`
	RoyaltyFee  string    `gorm:"size:78" json:"royalty_fee"`
	TxHash      string    `gorm:"size:66;not null" json:"tx_hash"`
	BlockNumber uint64    `json:"block_number"`
	Timestamp   time.Time `json:"timestamp"`
}

// IndexerState tracks the indexer's progress
type IndexerState struct {
	gorm.Model
	ChainID         int64  `gorm:"uniqueIndex;not null" json:"chain_id"`
	LastBlockNumber uint64 `json:"last_block_number"`
	LastBlockHash   string `gorm:"size:66" json:"last_block_hash"`
}

// AssetType constants
const (
	AssetTypeMineral    uint8 = 0
	AssetTypeStratum    uint8 = 1
	AssetTypeFossil     uint8 = 2
	AssetTypeSurvey     uint8 = 3
	AssetTypeGeopark    uint8 = 4
	AssetTypeCarbonSink uint8 = 5
)

// ListingStatus constants
const (
	ListingStatusActive    uint8 = 0
	ListingStatusSold      uint8 = 1
	ListingStatusCancelled uint8 = 2
)

// AssetTypeName returns the human-readable name for an asset type
func AssetTypeName(assetType uint8) string {
	names := map[uint8]string{
		AssetTypeMineral:    "Mineral",
		AssetTypeStratum:    "Stratum",
		AssetTypeFossil:     "Fossil",
		AssetTypeSurvey:     "Survey",
		AssetTypeGeopark:    "Geopark",
		AssetTypeCarbonSink: "Carbon Sink",
	}
	if name, ok := names[assetType]; ok {
		return name
	}
	return "Unknown"
}
