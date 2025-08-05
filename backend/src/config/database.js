const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Crear base de datos si no existe
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();

    // Crear tablas
    await createTables();
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

async function createTables() {
  try {
    // Tabla de criptomonedas
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cryptocurrencies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coin_id INT UNIQUE NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabla de historial de precios
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS price_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cryptocurrency_id INT NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        volume_24h DECIMAL(20, 2),
        market_cap DECIMAL(20, 2),
        percent_change_1h DECIMAL(10, 2),
        percent_change_24h DECIMAL(10, 2),
        percent_change_7d DECIMAL(10, 2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrencies(id),
        INDEX idx_crypto_time (cryptocurrency_id, timestamp)
      )
    `);

    // Tabla de monedas seleccionadas por el usuario
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS selected_cryptocurrencies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cryptocurrency_id INT NOT NULL,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrencies(id),
        UNIQUE KEY unique_crypto (cryptocurrency_id)
      )
    `);

  } catch (error) {
    console.error('Error al crear las tablas:', error);
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase
};