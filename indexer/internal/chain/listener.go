package chain

import (
	"context"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/geoasset/indexer/internal/config"
	"github.com/geoasset/indexer/internal/db"
	"github.com/geoasset/indexer/internal/models"
	"go.uber.org/zap"
)

// Event signatures
var (
	// GeoAsset events
	GeoAssetMintedSig    = crypto.Keccak256Hash([]byte("GeoAssetMinted(uint256,address,uint8,int256,int256,string)"))
	GeoAssetVerifiedSig  = crypto.Keccak256Hash([]byte("GeoAssetVerified(uint256,bool)"))
	TransferSig          = crypto.Keccak256Hash([]byte("Transfer(address,address,uint256)"))

	// Marketplace events
	ListingCreatedSig    = crypto.Keccak256Hash([]byte("ListingCreated(uint256,uint256,address,uint256)"))
	ListingSoldSig       = crypto.Keccak256Hash([]byte("ListingSold(uint256,uint256,address,uint256)"))
	ListingCancelledSig  = crypto.Keccak256Hash([]byte("ListingCancelled(uint256)"))
)

// Listener listens to blockchain events
type Listener struct {
	client     *ethclient.Client
	cfg        config.ChainConfig
	db         *db.Database
	logger     *zap.SugaredLogger

	geoAssetAddr    common.Address
	marketplaceAddr common.Address
}

// NewListener creates a new chain listener
func NewListener(cfg config.ChainConfig, database *db.Database, logger *zap.SugaredLogger) (*Listener, error) {
	client, err := ethclient.Dial(cfg.RPCURL)
	if err != nil {
		return nil, err
	}

	return &Listener{
		client:          client,
		cfg:             cfg,
		db:              database,
		logger:          logger,
		geoAssetAddr:    common.HexToAddress(cfg.GeoAssetAddress),
		marketplaceAddr: common.HexToAddress(cfg.MarketplaceAddress),
	}, nil
}

// Start starts the chain listener
func (l *Listener) Start(ctx context.Context) error {
	// Get starting block
	startBlock, err := l.getStartBlock()
	if err != nil {
		return err
	}

	l.logger.Infof("Starting from block %d", startBlock)

	// Main loop
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	currentBlock := startBlock

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// Get latest block
			latestBlock, err := l.client.BlockNumber(ctx)
			if err != nil {
				l.logger.Errorf("Failed to get latest block: %v", err)
				continue
			}

			// Account for confirmations
			safeBlock := latestBlock - l.cfg.ConfirmBlocks
			if safeBlock <= currentBlock {
				continue
			}

			// Process blocks in batches
			batchSize := uint64(100)
			toBlock := currentBlock + batchSize
			if toBlock > safeBlock {
				toBlock = safeBlock
			}

			if err := l.processBlocks(ctx, currentBlock, toBlock); err != nil {
				l.logger.Errorf("Failed to process blocks %d-%d: %v", currentBlock, toBlock, err)
				continue
			}

			currentBlock = toBlock + 1

			// Update indexer state
			if err := l.updateState(currentBlock - 1); err != nil {
				l.logger.Errorf("Failed to update state: %v", err)
			}
		}
	}
}

// getStartBlock determines the starting block for indexing
func (l *Listener) getStartBlock() (uint64, error) {
	// Try to get from database
	state, err := l.db.GetIndexerState(l.cfg.ChainID)
	if err == nil && state.LastBlockNumber > 0 {
		return state.LastBlockNumber + 1, nil
	}

	// Use configured start block
	if l.cfg.StartBlock > 0 {
		return l.cfg.StartBlock, nil
	}

	// Default to latest block
	return l.client.BlockNumber(context.Background())
}

// processBlocks processes a range of blocks
func (l *Listener) processBlocks(ctx context.Context, fromBlock, toBlock uint64) error {
	l.logger.Debugf("Processing blocks %d to %d", fromBlock, toBlock)

	// Build filter query
	addresses := []common.Address{l.geoAssetAddr}
	if l.marketplaceAddr != (common.Address{}) {
		addresses = append(addresses, l.marketplaceAddr)
	}

	query := ethereum.FilterQuery{
		FromBlock: big.NewInt(int64(fromBlock)),
		ToBlock:   big.NewInt(int64(toBlock)),
		Addresses: addresses,
	}

	logs, err := l.client.FilterLogs(ctx, query)
	if err != nil {
		return err
	}

	l.logger.Debugf("Found %d logs", len(logs))

	// Process each log
	for _, log := range logs {
		if err := l.processLog(ctx, log); err != nil {
			l.logger.Errorf("Failed to process log: %v", err)
			// Continue processing other logs
		}
	}

	return nil
}

// processLog processes a single log entry
func (l *Listener) processLog(ctx context.Context, log types.Log) error {
	if len(log.Topics) == 0 {
		return nil
	}

	switch log.Topics[0] {
	case GeoAssetMintedSig:
		return l.handleGeoAssetMinted(ctx, log)
	case GeoAssetVerifiedSig:
		return l.handleGeoAssetVerified(ctx, log)
	case TransferSig:
		return l.handleTransfer(ctx, log)
	case ListingCreatedSig:
		return l.handleListingCreated(ctx, log)
	case ListingSoldSig:
		return l.handleListingSold(ctx, log)
	case ListingCancelledSig:
		return l.handleListingCancelled(ctx, log)
	}

	return nil
}

// handleGeoAssetMinted handles GeoAssetMinted events
func (l *Listener) handleGeoAssetMinted(ctx context.Context, log types.Log) error {
	l.logger.Infof("GeoAssetMinted event at block %d", log.BlockNumber)

	// Parse event data
	// Topics: [sig, tokenId, owner, assetType]
	if len(log.Topics) < 4 {
		return nil
	}

	tokenID := new(big.Int).SetBytes(log.Topics[1].Bytes()).Uint64()
	owner := common.BytesToAddress(log.Topics[2].Bytes())
	assetType := uint8(new(big.Int).SetBytes(log.Topics[3].Bytes()).Uint64())

	// Parse non-indexed data (latitude, longitude, metadataURI)
	// This is simplified - actual implementation needs proper ABI decoding
	latitude := int64(0)
	longitude := int64(0)
	metadataURI := ""

	if len(log.Data) >= 64 {
		latitude = new(big.Int).SetBytes(log.Data[0:32]).Int64()
		longitude = new(big.Int).SetBytes(log.Data[32:64]).Int64()
		// metadataURI would need string decoding
	}

	// Get block timestamp
	block, err := l.client.BlockByNumber(ctx, big.NewInt(int64(log.BlockNumber)))
	if err != nil {
		return err
	}

	asset := &models.GeoAsset{
		TokenID:     tokenID,
		Owner:       owner.Hex(),
		AssetType:   assetType,
		Latitude:    latitude,
		Longitude:   longitude,
		MetadataURI: metadataURI,
		Verified:    false,
		MintedAt:    time.Unix(int64(block.Time()), 0),
		MintTxHash:  log.TxHash.Hex(),
		BlockNumber: log.BlockNumber,
	}

	return l.db.CreateGeoAsset(asset)
}

// handleGeoAssetVerified handles GeoAssetVerified events
func (l *Listener) handleGeoAssetVerified(ctx context.Context, log types.Log) error {
	l.logger.Infof("GeoAssetVerified event at block %d", log.BlockNumber)

	if len(log.Topics) < 2 {
		return nil
	}

	tokenID := new(big.Int).SetBytes(log.Topics[1].Bytes()).Uint64()
	verified := len(log.Data) > 0 && log.Data[len(log.Data)-1] == 1

	return l.db.UpdateGeoAssetVerified(tokenID, verified)
}

// handleTransfer handles Transfer events
func (l *Listener) handleTransfer(ctx context.Context, log types.Log) error {
	l.logger.Debugf("Transfer event at block %d", log.BlockNumber)

	if len(log.Topics) < 4 {
		return nil
	}

	from := common.BytesToAddress(log.Topics[1].Bytes())
	to := common.BytesToAddress(log.Topics[2].Bytes())
	tokenID := new(big.Int).SetBytes(log.Topics[3].Bytes()).Uint64()

	// Get block timestamp
	block, err := l.client.BlockByNumber(ctx, big.NewInt(int64(log.BlockNumber)))
	if err != nil {
		return err
	}

	// Create transfer record
	transfer := &models.Transfer{
		TokenID:     tokenID,
		From:        from.Hex(),
		To:          to.Hex(),
		TxHash:      log.TxHash.Hex(),
		BlockNumber: log.BlockNumber,
		Timestamp:   time.Unix(int64(block.Time()), 0),
	}

	if err := l.db.CreateTransfer(transfer); err != nil {
		return err
	}

	// Update asset owner (skip mint transfers from zero address)
	if from != (common.Address{}) {
		return l.db.UpdateGeoAssetOwner(tokenID, to.Hex())
	}

	return nil
}

// handleListingCreated handles ListingCreated events
func (l *Listener) handleListingCreated(ctx context.Context, log types.Log) error {
	l.logger.Infof("ListingCreated event at block %d", log.BlockNumber)

	// Parse event - simplified
	if len(log.Topics) < 4 {
		return nil
	}

	listingID := new(big.Int).SetBytes(log.Topics[1].Bytes()).Uint64()
	tokenID := new(big.Int).SetBytes(log.Topics[2].Bytes()).Uint64()
	seller := common.BytesToAddress(log.Topics[3].Bytes())

	price := "0"
	if len(log.Data) >= 32 {
		price = new(big.Int).SetBytes(log.Data[0:32]).String()
	}

	block, err := l.client.BlockByNumber(ctx, big.NewInt(int64(log.BlockNumber)))
	if err != nil {
		return err
	}

	listing := &models.Listing{
		ListingID:    listingID,
		TokenID:      tokenID,
		Seller:       seller.Hex(),
		Price:        price,
		Currency:     "0x0000000000000000000000000000000000000000", // ETH
		StartTime:    time.Unix(int64(block.Time()), 0),
		EndTime:      time.Unix(int64(block.Time())+86400*30, 0), // Default 30 days
		Status:       models.ListingStatusActive,
		CreateTxHash: log.TxHash.Hex(),
		BlockNumber:  log.BlockNumber,
	}

	return l.db.CreateListing(listing)
}

// handleListingSold handles ListingSold events
func (l *Listener) handleListingSold(ctx context.Context, log types.Log) error {
	l.logger.Infof("ListingSold event at block %d", log.BlockNumber)

	if len(log.Topics) < 2 {
		return nil
	}

	listingID := new(big.Int).SetBytes(log.Topics[1].Bytes()).Uint64()

	return l.db.UpdateListingStatus(listingID, models.ListingStatusSold)
}

// handleListingCancelled handles ListingCancelled events
func (l *Listener) handleListingCancelled(ctx context.Context, log types.Log) error {
	l.logger.Infof("ListingCancelled event at block %d", log.BlockNumber)

	if len(log.Topics) < 2 {
		return nil
	}

	listingID := new(big.Int).SetBytes(log.Topics[1].Bytes()).Uint64()

	return l.db.UpdateListingStatus(listingID, models.ListingStatusCancelled)
}

// updateState updates the indexer state in the database
func (l *Listener) updateState(blockNumber uint64) error {
	state := &models.IndexerState{
		ChainID:         l.cfg.ChainID,
		LastBlockNumber: blockNumber,
	}
	return l.db.CreateOrUpdateIndexerState(state)
}
