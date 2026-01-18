package db

import (
	"github.com/geoasset/indexer/internal/config"
	"github.com/geoasset/indexer/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Database wraps the GORM database connection
type Database struct {
	*gorm.DB
}

// NewDatabase creates a new database connection
func NewDatabase(cfg config.DatabaseConfig) (*Database, error) {
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	return &Database{db}, nil
}

// Migrate runs database migrations
func (d *Database) Migrate() error {
	return d.AutoMigrate(
		&models.GeoAsset{},
		&models.GeoAssetMetadata{},
		&models.Listing{},
		&models.Transfer{},
		&models.Sale,
		&models.IndexerState{},
	)
}

// ============================================================
// GeoAsset Repository Methods
// ============================================================

// CreateGeoAsset creates a new geo asset record
func (d *Database) CreateGeoAsset(asset *models.GeoAsset) error {
	return d.Create(asset).Error
}

// GetGeoAssetByTokenID retrieves a geo asset by token ID
func (d *Database) GetGeoAssetByTokenID(tokenID uint64) (*models.GeoAsset, error) {
	var asset models.GeoAsset
	err := d.Where("token_id = ?", tokenID).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

// GetGeoAssetsByOwner retrieves all geo assets owned by an address
func (d *Database) GetGeoAssetsByOwner(owner string, limit, offset int) ([]models.GeoAsset, int64, error) {
	var assets []models.GeoAsset
	var total int64

	query := d.Model(&models.GeoAsset{}).Where("owner = ?", owner)
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&assets).Error
	return assets, total, err
}

// GetGeoAssetsByType retrieves geo assets by type
func (d *Database) GetGeoAssetsByType(assetType uint8, limit, offset int) ([]models.GeoAsset, int64, error) {
	var assets []models.GeoAsset
	var total int64

	query := d.Model(&models.GeoAsset{}).Where("asset_type = ?", assetType)
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&assets).Error
	return assets, total, err
}

// GetGeoAssetsByBounds retrieves geo assets within geographic bounds
func (d *Database) GetGeoAssetsByBounds(minLat, maxLat, minLng, maxLng int64, limit, offset int) ([]models.GeoAsset, int64, error) {
	var assets []models.GeoAsset
	var total int64

	query := d.Model(&models.GeoAsset{}).
		Where("latitude >= ? AND latitude <= ?", minLat, maxLat).
		Where("longitude >= ? AND longitude <= ?", minLng, maxLng)
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&assets).Error
	return assets, total, err
}

// UpdateGeoAssetOwner updates the owner of a geo asset
func (d *Database) UpdateGeoAssetOwner(tokenID uint64, newOwner string) error {
	return d.Model(&models.GeoAsset{}).
		Where("token_id = ?", tokenID).
		Update("owner", newOwner).Error
}

// UpdateGeoAssetVerified updates the verified status of a geo asset
func (d *Database) UpdateGeoAssetVerified(tokenID uint64, verified bool) error {
	return d.Model(&models.GeoAsset{}).
		Where("token_id = ?", tokenID).
		Update("verified", verified).Error
}

// ============================================================
// Listing Repository Methods
// ============================================================

// CreateListing creates a new listing record
func (d *Database) CreateListing(listing *models.Listing) error {
	return d.Create(listing).Error
}

// GetListingByID retrieves a listing by ID
func (d *Database) GetListingByID(listingID uint64) (*models.Listing, error) {
	var listing models.Listing
	err := d.Where("listing_id = ?", listingID).First(&listing).Error
	if err != nil {
		return nil, err
	}
	return &listing, nil
}

// GetActiveListings retrieves all active listings
func (d *Database) GetActiveListings(limit, offset int) ([]models.Listing, int64, error) {
	var listings []models.Listing
	var total int64

	query := d.Model(&models.Listing{}).Where("status = ?", models.ListingStatusActive)
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&listings).Error
	return listings, total, err
}

// UpdateListingStatus updates the status of a listing
func (d *Database) UpdateListingStatus(listingID uint64, status uint8) error {
	return d.Model(&models.Listing{}).
		Where("listing_id = ?", listingID).
		Update("status", status).Error
}

// ============================================================
// Transfer Repository Methods
// ============================================================

// CreateTransfer creates a new transfer record
func (d *Database) CreateTransfer(transfer *models.Transfer) error {
	return d.Create(transfer).Error
}

// GetTransfersByTokenID retrieves all transfers for a token
func (d *Database) GetTransfersByTokenID(tokenID uint64, limit, offset int) ([]models.Transfer, int64, error) {
	var transfers []models.Transfer
	var total int64

	query := d.Model(&models.Transfer{}).Where("token_id = ?", tokenID)
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Order("timestamp DESC").Find(&transfers).Error
	return transfers, total, err
}

// ============================================================
// Indexer State Methods
// ============================================================

// GetIndexerState retrieves the indexer state for a chain
func (d *Database) GetIndexerState(chainID int64) (*models.IndexerState, error) {
	var state models.IndexerState
	err := d.Where("chain_id = ?", chainID).First(&state).Error
	if err != nil {
		return nil, err
	}
	return &state, nil
}

// UpdateIndexerState updates the indexer state
func (d *Database) UpdateIndexerState(chainID int64, blockNumber uint64, blockHash string) error {
	return d.Model(&models.IndexerState{}).
		Where("chain_id = ?", chainID).
		Updates(map[string]interface{}{
			"last_block_number": blockNumber,
			"last_block_hash":   blockHash,
		}).Error
}

// CreateOrUpdateIndexerState creates or updates the indexer state
func (d *Database) CreateOrUpdateIndexerState(state *models.IndexerState) error {
	return d.Save(state).Error
}

// ============================================================
// Statistics Methods
// ============================================================

// Stats holds aggregated statistics
type Stats struct {
	TotalAssets     int64 `json:"total_assets"`
	TotalListings   int64 `json:"total_listings"`
	TotalSales      int64 `json:"total_sales"`
	UniqueOwners    int64 `json:"unique_owners"`
	VerifiedAssets  int64 `json:"verified_assets"`
}

// GetStats retrieves aggregated statistics
func (d *Database) GetStats() (*Stats, error) {
	var stats Stats

	d.Model(&models.GeoAsset{}).Count(&stats.TotalAssets)
	d.Model(&models.Listing{}).Where("status = ?", models.ListingStatusActive).Count(&stats.TotalListings)
	d.Model(&models.Sale{}).Count(&stats.TotalSales)
	d.Model(&models.GeoAsset{}).Distinct("owner").Count(&stats.UniqueOwners)
	d.Model(&models.GeoAsset{}).Where("verified = ?", true).Count(&stats.VerifiedAssets)

	return &stats, nil
}
