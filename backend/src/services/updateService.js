const cron = require('node-cron');
const coinMarketCapService = require('./coinmarketcapService');
const databaseService = require('./databaseService');

class UpdateService {
  constructor() {
    this.isUpdating = false;
    this.updateCount = 0;
  }

  // Actualizar datos de las criptomonedas seleccionadas
  async updateSelectedCryptocurrencies() {
    if (this.isUpdating) {
      console.log('Actualización ya en progreso, saltando...');
      return;
    }

    this.isUpdating = true;
    
    try {
      console.log(`[${new Date().toISOString()}] Iniciando actualización #${++this.updateCount}...`);
      
      // Obtener criptomonedas seleccionadas
      const selectedCryptos = await databaseService.getSelectedCryptocurrencies();
      
      if (selectedCryptos.length === 0) {
        console.log('No hay criptomonedas seleccionadas para actualizar');
        return;
      }

      console.log(`Actualizando ${selectedCryptos.length} criptomonedas...`);

      // Obtener IDs de CoinMarketCap
      const coinIds = selectedCryptos.map(crypto => crypto.coin_id);
      
      // Obtener datos actualizados de la API
      const updatedData = await coinMarketCapService.getCryptocurrencyData(coinIds);
      
      // Guardar datos actualizados
      let successCount = 0;
      for (const crypto of selectedCryptos) {
        const apiData = updatedData[crypto.coin_id];
        
        if (apiData && apiData.quote && apiData.quote.USD) {
          const priceData = {
            price: apiData.quote.USD.price,
            volume_24h: apiData.quote.USD.volume_24h,
            market_cap: apiData.quote.USD.market_cap,
            percent_change_1h: apiData.quote.USD.percent_change_1h,
            percent_change_24h: apiData.quote.USD.percent_change_24h,
            percent_change_7d: apiData.quote.USD.percent_change_7d
          };
          
          await databaseService.savePriceHistory(crypto.id, priceData);
          successCount++;
          
          console.log(`✓ ${crypto.symbol}: $${priceData.price.toFixed(2)} (${priceData.percent_change_24h >= 0 ? '+' : ''}${priceData.percent_change_24h.toFixed(2)}%)`);
        }
      }
      
      console.log(`Actualización completada: ${successCount}/${selectedCryptos.length} criptomonedas actualizadas`);
      
    } catch (error) {
      console.error('Error durante la actualización:', error.message);
    } finally {
      this.isUpdating = false;
    }
  }

  // Generar datos históricos de demostración (solo para desarrollo)
  async generateHistoricalData() {
    try {
      console.log('Generando datos históricos de demostración...');
      
      const selectedCryptos = await databaseService.getSelectedCryptocurrencies();
      if (selectedCryptos.length === 0) return;

      // Obtener datos actuales
      const coinIds = selectedCryptos.map(crypto => crypto.coin_id);
      const currentData = await coinMarketCapService.getCryptocurrencyData(coinIds);

      // Generar datos para los últimos 7 días
      const now = new Date();
      const dataPoints = 50; // Número de puntos de datos a generar

      for (const crypto of selectedCryptos) {
        const apiData = currentData[crypto.coin_id];
        if (!apiData || !apiData.quote || !apiData.quote.USD) continue;

        const basePrice = apiData.quote.USD.price;
        const baseVolume = apiData.quote.USD.volume_24h;
        const baseMarketCap = apiData.quote.USD.market_cap;

        for (let i = dataPoints; i > 0; i--) {
          // Calcular tiempo hacia atrás
          const timestamp = new Date(now.getTime() - (i * 3 * 60 * 60 * 1000)); // 3 horas entre puntos
          
          // Generar variaciones realistas
          const priceVariation = (Math.random() - 0.5) * 0.1; // ±5%
          const trend = Math.sin(i / 10) * 0.05; // Tendencia sinusoidal
          
          const historicalData = {
            price: basePrice * (1 + priceVariation + trend),
            volume_24h: baseVolume * (0.8 + Math.random() * 0.4),
            market_cap: baseMarketCap * (1 + priceVariation + trend),
            percent_change_1h: (Math.random() - 0.5) * 5,
            percent_change_24h: (Math.random() - 0.5) * 15,
            percent_change_7d: (Math.random() - 0.5) * 30,
            timestamp: timestamp
          };

          // Guardar en base de datos con timestamp específico
          await databaseService.savePriceHistoryWithTimestamp(crypto.id, historicalData);
        }

        console.log(`✓ Datos históricos generados para ${crypto.symbol}`);
      }

      console.log('Generación de datos históricos completada');
    } catch (error) {
      console.error('Error al generar datos históricos:', error);
    }
  }

  // Iniciar actualizaciones programadas
  startScheduledUpdates() {
    const interval = process.env.UPDATE_INTERVAL || 5;
    
    // Ejecutar cada X minutos
    cron.schedule(`*/${interval} * * * *`, async () => {
      await this.updateSelectedCryptocurrencies();
    });
    
    console.log(`Actualizaciones programadas cada ${interval} minutos`);
    
    // Generar datos históricos si es necesario (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => {
        this.generateHistoricalData();
      }, 5000); // Esperar 5 segundos después del inicio
    }
    
    // Ejecutar una actualización inicial
    this.updateSelectedCryptocurrencies();
  }
}

module.exports = new UpdateService();