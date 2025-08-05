const { pool } = require('../config/database');

class DatabaseService {
  // Guardar o actualizar criptomoneda
  async saveCryptocurrency(cryptoData) {
    try {
      const { id, symbol, name, slug } = cryptoData;
      
      await pool.execute(`
        INSERT INTO cryptocurrencies (coin_id, symbol, name, slug)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        symbol = VALUES(symbol),
        name = VALUES(name),
        slug = VALUES(slug),
        updated_at = CURRENT_TIMESTAMP
      `, [id, symbol, name, slug]);
      
      // Obtener el ID de la base de datos
      const [rows] = await pool.execute(
        'SELECT id FROM cryptocurrencies WHERE coin_id = ?',
        [id]
      );
      
      return rows[0].id;
    } catch (error) {
      console.error('Error al guardar criptomoneda:', error);
      throw error;
    }
  }

  // Guardar historial de precios
  async savePriceHistory(cryptoDbId, priceData) {
    try {
      const { price, volume_24h, market_cap, percent_change_1h, percent_change_24h, percent_change_7d } = priceData;
      
      await pool.execute(`
        INSERT INTO price_history 
        (cryptocurrency_id, price, volume_24h, market_cap, percent_change_1h, percent_change_24h, percent_change_7d)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [cryptoDbId, price, volume_24h, market_cap, percent_change_1h, percent_change_24h, percent_change_7d]);
      
    } catch (error) {
      console.error('Error al guardar historial de precios:', error);
      throw error;
    }
  }

  // Obtener criptomonedas seleccionadas
  async getSelectedCryptocurrencies() {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, sc.position
        FROM selected_cryptocurrencies sc
        JOIN cryptocurrencies c ON sc.cryptocurrency_id = c.id
        ORDER BY sc.position
      `);
      
      return rows;
    } catch (error) {
      console.error('Error al obtener criptomonedas seleccionadas:', error);
      throw error;
    }
  }

  // Agregar criptomoneda a seleccionadas
  async addSelectedCryptocurrency(cryptoDbId) {
    try {
      // Obtener la posición máxima actual
      const [maxPos] = await pool.execute(
        'SELECT COALESCE(MAX(position), -1) as maxPos FROM selected_cryptocurrencies'
      );
      
      const newPosition = maxPos[0].maxPos + 1;
      
      await pool.execute(`
        INSERT IGNORE INTO selected_cryptocurrencies (cryptocurrency_id, position)
        VALUES (?, ?)
      `, [cryptoDbId, newPosition]);
      
    } catch (error) {
      console.error('Error al agregar criptomoneda seleccionada:', error);
      throw error;
    }
  }

  // Eliminar criptomoneda de seleccionadas
  async removeSelectedCryptocurrency(cryptoDbId) {
    try {
      await pool.execute(
        'DELETE FROM selected_cryptocurrencies WHERE cryptocurrency_id = ?',
        [cryptoDbId]
      );
    } catch (error) {
      console.error('Error al eliminar criptomoneda seleccionada:', error);
      throw error;
    }
  }

  // Obtener historial de precios
  async getPriceHistory(cryptoDbId, startDate, endDate) {
    try {
      const [rows] = await pool.execute(`
        SELECT price, volume_24h, market_cap, percent_change_24h, timestamp
        FROM price_history
        WHERE cryptocurrency_id = ? 
        AND timestamp BETWEEN ? AND ?
        ORDER BY timestamp ASC
      `, [cryptoDbId, startDate, endDate]);
      
      return rows;
    } catch (error) {
      console.error('Error al obtener historial de precios:', error);
      throw error;
    }
  }

  // Obtener último precio registrado
  async getLatestPrices(cryptoIds) {
    try {
      const placeholders = cryptoIds.map(() => '?').join(',');
      const [rows] = await pool.execute(`
        SELECT ph.*, c.coin_id, c.symbol, c.name
        FROM price_history ph
        JOIN cryptocurrencies c ON ph.cryptocurrency_id = c.id
        WHERE ph.cryptocurrency_id IN (${placeholders})
        AND ph.timestamp = (
          SELECT MAX(timestamp)
          FROM price_history
          WHERE cryptocurrency_id = ph.cryptocurrency_id
        )
      `, cryptoIds);
      
      return rows;
    } catch (error) {
      console.error('Error al obtener últimos precios:', error);
      throw error;
    }
  }
  // Agregar al final de la clase DatabaseService, antes del último }

  // Guardar historial de precios con timestamp específico
  async savePriceHistoryWithTimestamp(cryptoDbId, priceData) {
    try {
      const { price, volume_24h, market_cap, percent_change_1h, percent_change_24h, percent_change_7d, timestamp } = priceData;
      
      await pool.execute(`
        INSERT INTO price_history 
        (cryptocurrency_id, price, volume_24h, market_cap, percent_change_1h, percent_change_24h, percent_change_7d, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [cryptoDbId, price, volume_24h, market_cap, percent_change_1h, percent_change_24h, percent_change_7d, timestamp]);
      
    } catch (error) {
      console.error('Error al guardar historial de precios con timestamp:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();