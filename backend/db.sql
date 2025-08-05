-- Modelo de Base de Datos para CryptoInvestment
CREATE DATABASE IF NOT EXISTS crypto_investment;
USE crypto_investment;

-- Tabla de criptomonedas
CREATE TABLE IF NOT EXISTS cryptocurrencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coin_id INT UNIQUE NOT NULL COMMENT 'ID de CoinMarketCap',
  symbol VARCHAR(10) NOT NULL COMMENT 'Símbolo (BTC, ETH, etc)',
  name VARCHAR(100) NOT NULL COMMENT 'Nombre completo',
  slug VARCHAR(100) NOT NULL COMMENT 'Slug para URLs',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de historial de precios
CREATE TABLE IF NOT EXISTS price_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cryptocurrency_id INT NOT NULL,
  price DECIMAL(20, 8) NOT NULL COMMENT 'Precio en USD',
  volume_24h DECIMAL(20, 2) COMMENT 'Volumen en 24h',
  market_cap DECIMAL(20, 2) COMMENT 'Capitalización de mercado',
  percent_change_1h DECIMAL(10, 2) COMMENT 'Cambio % en 1 hora',
  percent_change_24h DECIMAL(10, 2) COMMENT 'Cambio % en 24 horas',
  percent_change_7d DECIMAL(10, 2) COMMENT 'Cambio % en 7 días',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrencies(id),
  INDEX idx_crypto_time (cryptocurrency_id, timestamp)
);

-- Tabla de criptomonedas seleccionadas por el usuario
CREATE TABLE IF NOT EXISTS selected_cryptocurrencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cryptocurrency_id INT NOT NULL,
  position INT DEFAULT 0 COMMENT 'Orden de visualización',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrencies(id),
  UNIQUE KEY unique_crypto (cryptocurrency_id)
);