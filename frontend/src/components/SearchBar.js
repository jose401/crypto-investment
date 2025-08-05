import React, { useState, useEffect, useRef } from 'react';
import { searchCryptocurrencies } from '../services/api';
import './SearchBar.css';

function SearchBar({ onAddCrypto, selectedCryptos }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar con debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    
    // Cancelar búsqueda anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce de 300ms
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchCryptocurrencies(query);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error al buscar:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  // Verificar si la criptomoneda ya está seleccionada
  const isAlreadySelected = (cryptoId) => {
    return selectedCryptos.some(crypto => crypto.coin_id === cryptoId);
  };

  // Manejar selección
  const handleSelect = (crypto) => {
    if (!isAlreadySelected(crypto.id)) {
      onAddCrypto(crypto);
      setQuery('');
      setResults([]);
      setShowDropdown(false);
    }
  };

  // Formatear número grande
  const formatMarketCap = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar criptomonedas por nombre o símbolo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <div className="search-loading">🔍</div>}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((crypto) => (
            <div
              key={crypto.id}
              className={`search-result ${isAlreadySelected(crypto.id) ? 'disabled' : ''}`}
              onClick={() => handleSelect(crypto)}
            >
              <div className="search-result-info">
                <span className="crypto-symbol">{crypto.symbol}</span>
                <span className="crypto-name">{crypto.name}</span>
              </div>
              <div className="search-result-price">
                <span className="crypto-price">
                  ${crypto.quote.USD.price.toFixed(2)}
                </span>
                <span className={`crypto-change ${crypto.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}`}>
                  {crypto.quote.USD.percent_change_24h >= 0 ? '+' : ''}
                  {crypto.quote.USD.percent_change_24h.toFixed(2)}%
                </span>
              </div>
              {isAlreadySelected(crypto.id) && (
                <span className="already-selected">Ya agregada</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;