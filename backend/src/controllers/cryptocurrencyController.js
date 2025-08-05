const coinMarketCapService = require('../services/coinmarketcapService');
const databaseService = require('../services/databaseService');

class CryptocurrencyController {
  // Buscar criptomonedas
  async search(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'La búsqueda debe tener al menos 2 caracteres'
        });
      }
      
      const results = await coinMarketCapService.searchCryptocurrencies(query);
      
      res.json({
        success: true,
        data: results
      });
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar criptomonedas'
      });
    }
  }

  // Obtener criptomonedas seleccionadas con datos actuales
  async getSelected(req, res) {
    try {
      const selectedCryptos = await databaseService.getSelectedCryptocurrencies();
      
      if (selectedCryptos.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Obtener los últimos precios de la base de datos
      const cryptoIds = selectedCryptos.map(c => c.id);
      const latestPrices = await databaseService.getLatestPrices(cryptoIds);
      
      // Combinar datos
      const result = selectedCryptos.map(crypto => {
        const priceData = latestPrices.find(p => p.cryptocurrency_id === crypto.id);
        return {
          ...crypto,
          currentPrice: priceData ? {
            price: parseFloat(priceData.price),
            volume_24h: parseFloat(priceData.volume_24h),
            market_cap: parseFloat(priceData.market_cap),
            percent_change_1h: parseFloat(priceData.percent_change_1h),
            percent_change_24h: parseFloat(priceData.percent_change_24h),
            percent_change_7d: parseFloat(priceData.percent_change_7d),
            last_updated: priceData.timestamp
          } : null
        };
      });
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Error al obtener criptomonedas seleccionadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener criptomonedas seleccionadas'
      });
    }
  }

  // Agregar criptomoneda a la lista de seguimiento
  async addToWatchlist(req, res) {
    try {
      const { cryptoData } = req.body;
      
      if (!cryptoData || !cryptoData.id) {
        return res.status(400).json({
          success: false,
          message: 'Datos de criptomoneda inválidos'
        });
      }
      
      // Guardar o actualizar la criptomoneda
      const dbId = await databaseService.saveCryptocurrency(cryptoData);
      
      // Agregar a seleccionadas
      await databaseService.addSelectedCryptocurrency(dbId);
      
      // Obtener datos actuales de la API
      const apiData = await coinMarketCapService.getCryptocurrencyData([cryptoData.id]);
      const currentData = apiData[cryptoData.id];
      
      if (currentData && currentData.quote && currentData.quote.USD) {
        const priceData = {
          price: currentData.quote.USD.price,
          volume_24h: currentData.quote.USD.volume_24h,
          market_cap: currentData.quote.USD.market_cap,
          percent_change_1h: currentData.quote.USD.percent_change_1h,
          percent_change_24h: currentData.quote.USD.percent_change_24h,
          percent_change_7d: currentData.quote.USD.percent_change_7d
        };
        
        await databaseService.savePriceHistory(dbId, priceData);
      }
      
      res.json({
        success: true,
        message: 'Criptomoneda agregada exitosamente'
      });
      
    } catch (error) {
      console.error('Error al agregar criptomoneda:', error);
      res.status(500).json({
        success: false,
        message: 'Error al agregar criptomoneda'
      });
    }
  }

  // Eliminar criptomoneda de la lista de seguimiento
  async removeFromWatchlist(req, res) {
    try {
      const { id } = req.params;
      
      await databaseService.removeSelectedCryptocurrency(id);
      
      res.json({
        success: true,
        message: 'Criptomoneda eliminada exitosamente'
      });
      
    } catch (error) {
      console.error('Error al eliminar criptomoneda:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar criptomoneda'
      });
    }
  }

  // Obtener historial de precios
  async getPriceHistory(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      // Validar fechas
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      
      const history = await databaseService.getPriceHistory(id, start, end);
      
      res.json({
        success: true,
        data: history
      });
      
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de precios'
      });
    }
  }
}

module.exports = new CryptocurrencyController();