package api

import (
	"context"
	"strconv"
	"time"

	"github.com/geoasset/indexer/internal/config"
	"github.com/geoasset/indexer/internal/db"
	"github.com/geoasset/indexer/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"go.uber.org/zap"
)

// Server represents the API server
type Server struct {
	app    *fiber.App
	cfg    config.ServerConfig
	db     *db.Database
	logger *zap.SugaredLogger
}

// NewServer creates a new API server
func NewServer(cfg config.ServerConfig, database *db.Database, log *zap.SugaredLogger) *Server {
	app := fiber.New(fiber.Config{
		ReadTimeout:  time.Duration(cfg.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(cfg.IdleTimeout) * time.Second,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	server := &Server{
		app:    app,
		cfg:    cfg,
		db:     database,
		logger: log,
	}

	// Register routes
	server.registerRoutes()

	return server
}

// registerRoutes registers all API routes
func (s *Server) registerRoutes() {
	api := s.app.Group("/api/v1")

	// Health check
	api.Get("/health", s.healthCheck)

	// Assets
	assets := api.Group("/assets")
	assets.Get("/", s.getAssets)
	assets.Get("/:tokenId", s.getAssetByTokenID)
	assets.Get("/owner/:address", s.getAssetsByOwner)
	assets.Get("/type/:type", s.getAssetsByType)
	assets.Get("/bounds", s.getAssetsByBounds)

	// Listings
	listings := api.Group("/listings")
	listings.Get("/", s.getActiveListings)
	listings.Get("/:listingId", s.getListingByID)

	// Transfers
	transfers := api.Group("/transfers")
	transfers.Get("/token/:tokenId", s.getTransfersByTokenID)

	// Stats
	api.Get("/stats", s.getStats)
}

// Start starts the API server
func (s *Server) Start() error {
	return s.app.Listen(":" + s.cfg.Port)
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown() error {
	return s.app.ShutdownWithContext(context.Background())
}

// ============================================================
// Handlers
// ============================================================

// healthCheck handles health check requests
func (s *Server) healthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "ok",
		"time":   time.Now().UTC(),
	})
}

// getAssets handles GET /assets
func (s *Server) getAssets(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	var assets []models.GeoAsset
	var total int64

	query := s.db.Model(&models.GeoAsset{})
	query.Count(&total)
	query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&assets)

	return c.JSON(fiber.Map{
		"data": assets,
		"pagination": fiber.Map{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// getAssetByTokenID handles GET /assets/:tokenId
func (s *Server) getAssetByTokenID(c *fiber.Ctx) error {
	tokenIDStr := c.Params("tokenId")
	tokenID, err := strconv.ParseUint(tokenIDStr, 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid token ID"})
	}

	asset, err := s.db.GetGeoAssetByTokenID(tokenID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Asset not found"})
	}

	return c.JSON(asset)
}

// getAssetsByOwner handles GET /assets/owner/:address
func (s *Server) getAssetsByOwner(c *fiber.Ctx) error {
	address := c.Params("address")
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	assets, total, err := s.db.GetGeoAssetsByOwner(address, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch assets"})
	}

	return c.JSON(fiber.Map{
		"data": assets,
		"pagination": fiber.Map{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// getAssetsByType handles GET /assets/type/:type
func (s *Server) getAssetsByType(c *fiber.Ctx) error {
	assetTypeStr := c.Params("type")
	assetType, err := strconv.ParseUint(assetTypeStr, 10, 8)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid asset type"})
	}

	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	assets, total, err := s.db.GetGeoAssetsByType(uint8(assetType), limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch assets"})
	}

	return c.JSON(fiber.Map{
		"data": assets,
		"pagination": fiber.Map{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// getAssetsByBounds handles GET /assets/bounds
func (s *Server) getAssetsByBounds(c *fiber.Ctx) error {
	minLat, _ := strconv.ParseInt(c.Query("minLat", "0"), 10, 64)
	maxLat, _ := strconv.ParseInt(c.Query("maxLat", "0"), 10, 64)
	minLng, _ := strconv.ParseInt(c.Query("minLng", "0"), 10, 64)
	maxLng, _ := strconv.ParseInt(c.Query("maxLng", "0"), 10, 64)
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	assets, total, err := s.db.GetGeoAssetsByBounds(minLat, maxLat, minLng, maxLng, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch assets"})
	}

	return c.JSON(fiber.Map{
		"data": assets,
		"pagination": fiber.Map{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// getActiveListings handles GET /listings
func (s *Server) getActiveListings(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	listings, total, err := s.db.GetActiveListings(limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch listings"})
	}

	return c.JSON(fiber.Map{
		"data": listings,
		"pagination": fiber.Map{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// getListingByID handles GET /listings/:listingId
func (s *Server) getListingByID(c *fiber.Ctx) error {
	listingIDStr := c.Params("listingId")
	listingID, err := strconv.ParseUint(listingIDStr, 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid listing ID"})
	}

	listing, err := s.db.GetListingByID(listingID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Listing not found"})
	}

	return c.JSON(listing)
}

// getTransfersByTokenID handles GET /transfers/token/:tokenId
func (s *Server) getTransfersByTokenID(c *fiber.Ctx) error {
	tokenIDStr := c.Params("tokenId")
	tokenID, err := strconv.ParseUint(tokenIDStr, 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid token ID"})
	}

	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	transfers, total, err := s.db.GetTransfersByTokenID(tokenID, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch transfers"})
	}

	return c.JSON(fiber.Map{
		"data": transfers,
		"pagination": fiber.Map{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// getStats handles GET /stats
func (s *Server) getStats(c *fiber.Ctx) error {
	stats, err := s.db.GetStats()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch stats"})
	}

	return c.JSON(stats)
}
