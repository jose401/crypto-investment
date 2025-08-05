import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import CryptoCard from './components/CryptoCard';
import PriceChart from './components/PriceChart';
import LoadingSpinner from './components/LoadingSpinner';
import { getCryptocurrencies, addToWatchlist, removeFromWatchlist } from './services/api';

function App() {
  const [selectedCryptos, setSelectedCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForChart, setSelectedForChart] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [theme, setTheme] = useState(() => {
    // Obtener tema guardado o usar el del sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Cargar criptomonedas seleccionadas
  const loadSelectedCryptos = async () => {
    try {
      const data = await getCryptocurrencies();
      setSelectedCryptos(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      console.error('Error al cargar criptomonedas:', error);
      setError('Error al cargar las criptomonedas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al inicio
  useEffect(() => {
    loadSelectedCryptos();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadSelectedCryptos, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Agregar criptomoneda
  const handleAddCrypto = async (crypto) => {
    try {
      setLoading(true);
      await addToWatchlist(crypto);
      await loadSelectedCryptos();
    } catch (error) {
      console.error('Error al agregar criptomoneda:', error);
      setError('Error al agregar la criptomoneda');
    }
  };

  // Eliminar criptomoneda
  const handleRemoveCrypto = async (cryptoId) => {
    try {
      await removeFromWatchlist(cryptoId);
      if (selectedForChart?.id === cryptoId) {
        setSelectedForChart(null);
      }
      await loadSelectedCryptos();
    } catch (error) {
      console.error('Error al eliminar criptomoneda:', error);
      setError('Error al eliminar la criptomoneda');
    }
  };

  // Seleccionar para ver gráfico
  const handleSelectForChart = (crypto) => {
    setSelectedForChart(crypto);
  };

  // Toggle tema
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo">
                <span className="logo-icon">₿</span>
                <h1>CryptoInvestment</h1>
              </div>
              <p className="tagline">Monitor Profesional de Criptomonedas</p>
            </div>
            <div className="header-actions">
              <div className="last-update">
                <span className="update-label">Última actualización</span>
                <span className="update-time">{lastUpdate.toLocaleTimeString()}</span>
              </div>
              <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          <div className="search-section">
            <SearchBar 
              onAddCrypto={handleAddCrypto} 
              selectedCryptos={selectedCryptos}
            />
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {selectedCryptos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>Comienza tu análisis</h3>
                  <p>Busca y agrega criptomonedas para monitorear su rendimiento en tiempo real</p>
                </div>
              ) : (
                <div className="content-grid">
                  <div className="crypto-list-section">
                    <h2 className="section-title">
                      <span>Portafolio</span>
                      <span className="crypto-count">{selectedCryptos.length}</span>
                    </h2>
                    <div className="crypto-grid">
                      {selectedCryptos.map(crypto => (
                        <CryptoCard
                          key={crypto.id}
                          crypto={crypto}
                          onRemove={() => handleRemoveCrypto(crypto.id)}
                          onSelectChart={() => handleSelectForChart(crypto)}
                          isSelected={selectedForChart?.id === crypto.id}
                        />
                      ))}
                    </div>
                  </div>

                  {selectedForChart && (
                    <div className="chart-container-section">
                      <PriceChart crypto={selectedForChart} theme={theme} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p>© 2024 CryptoInvestment</p>
          <span className="separator">•</span>
          <p>Datos en tiempo real por CoinMarketCap</p>
        </div>
      </footer>
    </div>
  );
}

export default App;