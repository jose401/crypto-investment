const axios = require('axios');
require('dotenv').config();

class CoinMarketCapService {
  constructor() {
    this.baseURL = 'https://pro-api.coinmarketcap.com/v1';
    this.apiKey = process.env.COINMARKETCAP_API_KEY;
    this.headers = {
      'X-CMC_PRO_API_KEY': this.apiKey,
      'Accept': 'application/json'
    };
  }

  // Obtener lista de criptomonedas disponibles
  async getAvailableCryptocurrencies(limit = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/cryptocurrency/listings/latest`, {
        headers: this.headers,
        params: {
          start: 1,
          limit: limit,
          convert: 'USD'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener criptomonedas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obtener datos específicos de criptomonedas por IDs
  async getCryptocurrencyData(ids) {
    try {
      const response = await axios.get(`${this.baseURL}/cryptocurrency/quotes/latest`, {
        headers: this.headers,
        params: {
          id: ids.join(','),
          convert: 'USD'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener datos de criptomonedas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar criptomonedas por nombre o símbolo
  async searchCryptocurrencies(query) {
    try {
      // Primero obtenemos todas las monedas disponibles
      const allCryptos = await this.getAvailableCryptocurrencies(200);
      
      // Filtramos localmente por nombre o símbolo
      const filtered = allCryptos.filter(crypto => 
        crypto.name.toLowerCase().includes(query.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(query.toLowerCase())
      );
      
      return filtered.slice(0, 20); // Limitamos a 20 resultados
    } catch (error) {
      console.error('Error al buscar criptomonedas:', error);
      throw error;
    }
  }
}

module.exports = new CoinMarketCapService();