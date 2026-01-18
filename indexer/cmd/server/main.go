package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/geoasset/indexer/internal/api"
	"github.com/geoasset/indexer/internal/chain"
	"github.com/geoasset/indexer/internal/config"
	"github.com/geoasset/indexer/internal/db"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	// Load .env file
	_ = godotenv.Load()

	// Initialize logger
	logger, _ := zap.NewProduction()
	if os.Getenv("ENV") == "development" {
		logger, _ = zap.NewDevelopment()
	}
	defer logger.Sync()

	sugar := logger.Sugar()
	sugar.Info("Starting GeoAsset Indexer...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		sugar.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	database, err := db.NewDatabase(cfg.Database)
	if err != nil {
		sugar.Fatalf("Failed to connect to database: %v", err)
	}
	sugar.Info("Database connected")

	// Run migrations
	if err := database.Migrate(); err != nil {
		sugar.Fatalf("Failed to run migrations: %v", err)
	}
	sugar.Info("Database migrations completed")

	// Initialize chain listener
	chainListener, err := chain.NewListener(cfg.Chain, database, sugar)
	if err != nil {
		sugar.Fatalf("Failed to create chain listener: %v", err)
	}

	// Create context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start chain listener in background
	go func() {
		if err := chainListener.Start(ctx); err != nil {
			sugar.Errorf("Chain listener error: %v", err)
		}
	}()
	sugar.Info("Chain listener started")

	// Initialize API server
	server := api.NewServer(cfg.Server, database, sugar)

	// Start API server in background
	go func() {
		if err := server.Start(); err != nil {
			sugar.Errorf("API server error: %v", err)
		}
	}()
	sugar.Infof("API server started on port %s", cfg.Server.Port)

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	sugar.Info("Shutting down...")

	// Graceful shutdown
	cancel()
	if err := server.Shutdown(); err != nil {
		sugar.Errorf("Server shutdown error: %v", err)
	}

	sugar.Info("Indexer stopped")
}
