import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API:', error);
    return Promise.reject(error);
  }
);

// Buscar criptomonedas
export const searchCryptocurrencies = async (query) => {
  try {
    const response = await api.get('/cryptocurrencies/search', {
      params: { query }
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Obtener criptomonedas seleccionadas
export const getCryptocurrencies = async () => {
  try {
    const response = await api.get('/cryptocurrencies/selected');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Agregar criptomoneda a la lista de seguimiento
export const addToWatchlist = async (cryptoData) => {
  try {
    const response = await api.post('/cryptocurrencies/watchlist', {
      cryptoData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar criptomoneda de la lista de seguimiento
export const removeFromWatchlist = async (cryptoId) => {
  try {
    const response = await api.delete(`/cryptocurrencies/watchlist/${cryptoId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener historial de precios
export const getPriceHistory = async (cryptoId, startDate, endDate) => {
  try {
    const response = await api.get(`/cryptocurrencies/history/${cryptoId}`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Verificar estado del servidor
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};