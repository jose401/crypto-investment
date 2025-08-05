const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./src/config/database');
const cryptocurrencyRoutes = require('./src/routes/cryptocurrencyRoutes');
const updateService = require('./src/services/updateService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/cryptocurrencies', cryptocurrencyRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      port: PORT,
      hasApiKey: !!process.env.COINMARKETCAP_API_KEY,
      dbHost: process.env.DB_HOST || 'localhost'
    }
  });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Inicializar servidor
async function startServer() {
  try {
    console.log('=== INICIANDO SERVIDOR ===');
    console.log('Puerto:', PORT);
    console.log('API Key configurada:', !!process.env.COINMARKETCAP_API_KEY);
    
    // Inicializar base de datos
    console.log('Conectando a la base de datos...');
    await initializeDatabase();
    console.log('✓ Base de datos conectada');
    
    // Iniciar actualizaciones programadas
    console.log('Iniciando servicio de actualizaciones...');
    updateService.startScheduledUpdates();
    console.log('✓ Servicio de actualizaciones iniciado');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
      console.log('=== SERVIDOR LISTO ===');
    });
    
  } catch (error) {
    console.error('ERROR FATAL:', error.message);
    console.error('Detalles:', error);
    
    // Intentar iniciar el servidor sin base de datos para debugging
    console.log('Intentando iniciar servidor sin base de datos...');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en modo DEBUG en http://localhost:${PORT}`);
    });
  }
}

startServer();