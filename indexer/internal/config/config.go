package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all configuration for the indexer
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Chain    ChainConfig
	Redis    RedisConfig
}

// ServerConfig holds API server configuration
type ServerConfig struct {
	Port         string
	ReadTimeout  int
	WriteTimeout int
	IdleTimeout  int
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// ChainConfig holds blockchain configuration
type ChainConfig struct {
	RPCURL           string
	ChainID          int64
	GeoAssetAddress  string
	MarketplaceAddress string
	RegistryAddress  string
	StartBlock       uint64
	ConfirmBlocks    uint64
}

// RedisConfig holds Redis configuration
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{
		Server: ServerConfig{
			Port:         getEnv("SERVER_PORT", "8080"),
			ReadTimeout:  getEnvInt("SERVER_READ_TIMEOUT", 10),
			WriteTimeout: getEnvInt("SERVER_WRITE_TIMEOUT", 10),
			IdleTimeout:  getEnvInt("SERVER_IDLE_TIMEOUT", 120),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "geoasset"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Chain: ChainConfig{
			RPCURL:           getEnv("CHAIN_RPC_URL", "https://sepolia.base.org"),
			ChainID:          getEnvInt64("CHAIN_ID", 84532),
			GeoAssetAddress:  getEnv("GEOASSET_ADDRESS", ""),
			MarketplaceAddress: getEnv("MARKETPLACE_ADDRESS", ""),
			RegistryAddress:  getEnv("REGISTRY_ADDRESS", ""),
			StartBlock:       getEnvUint64("START_BLOCK", 0),
			ConfirmBlocks:    getEnvUint64("CONFIRM_BLOCKS", 12),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
	}

	// Validate required fields
	if cfg.Chain.GeoAssetAddress == "" {
		return nil, fmt.Errorf("GEOASSET_ADDRESS is required")
	}

	return cfg, nil
}

// DSN returns the database connection string
func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvUint64(key string, defaultValue uint64) uint64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseUint(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}
