import React from 'react';
import './CryptoCard.css';

function CryptoCard({ crypto, onRemove, onSelectChart, isSelected }) {
  const formatPrice = (price) => {
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (volume) => {
    return formatLargeNumber(volume);
  };

  const getChangeClass = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  const getTrendIndicator = (change1h, change24h, change7d) => {
    const avgChange = (change1h + change24h + change7d) / 3;
    if (avgChange > 5) return { text: 'Muy Alcista', class: 'very-bullish' };
    if (avgChange > 0) return { text: 'Alcista', class: 'bullish' };
    if (avgChange > -5) return { text: 'Neutral', class: 'neutral' };
    return { text: 'Bajista', class: 'bearish' };
  };

  if (!crypto.currentPrice) {
    return (
      <div className="crypto-card loading">
        <div className="loading-content">
          <div className="loading-skeleton title"></div>
          <div className="loading-skeleton price"></div>
          <div className="loading-skeleton stats"></div>
        </div>
      </div>
    );
  }

  const { currentPrice } = crypto;
  const trend = getTrendIndicator(
    currentPrice.percent_change_1h,
    currentPrice.percent_change_24h,
    currentPrice.percent_change_7d
  );

  return (
    <div className={`crypto-card ${isSelected ? 'selected' : ''}`}>
      <div className="crypto-header">
        <div className="crypto-title">
          <div className="crypto-main-info">
            <h3>{crypto.symbol}</h3>
            <span className="crypto-rank">#{crypto.position + 1}</span>
          </div>
          <p>{crypto.name}</p>
        </div>
        <button 
          className="remove-btn"
          onClick={onRemove}
          title="Eliminar de la lista"
        >
          ✕
        </button>
      </div>

      <div className="crypto-price-section">
        <div className="current-price">
          ${formatPrice(currentPrice.price)}
        </div>
        <div className={`price-change ${getChangeClass(currentPrice.percent_change_24h)}`}>
          <span className="change-icon">{getChangeIcon(currentPrice.percent_change_24h)}</span>
          <span>{Math.abs(currentPrice.percent_change_24h).toFixed(2)}%</span>
        </div>
      </div>

      <div className="trend-indicator">
        <span className={`trend-badge ${trend.class}`}>{trend.text}</span>
        <span className="last-update">
          Actualizado: {new Date(currentPrice.last_updated).toLocaleTimeString()}
        </span>
      </div>

      <div className="crypto-stats">
        <div className="stat">
          <span className="stat-label">1h</span>
          <span className={`stat-value ${getChangeClass(currentPrice.percent_change_1h)}`}>
            {currentPrice.percent_change_1h >= 0 ? '+' : ''}
            {currentPrice.percent_change_1h.toFixed(2)}%
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">24h</span>
          <span className={`stat-value ${getChangeClass(currentPrice.percent_change_24h)}`}>
            {currentPrice.percent_change_24h >= 0 ? '+' : ''}
            {currentPrice.percent_change_24h.toFixed(2)}%
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">7d</span>
          <span className={`stat-value ${getChangeClass(currentPrice.percent_change_7d)}`}>
            {currentPrice.percent_change_7d >= 0 ? '+' : ''}
            {currentPrice.percent_change_7d.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="crypto-info">
        <div className="info-item">
          <span className="info-label">Cap. Mercado</span>
          <span className="info-value">{formatLargeNumber(currentPrice.market_cap)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Volumen 24h</span>
          <span className="info-value">{formatVolume(currentPrice.volume_24h)}</span>
        </div>
      </div>

      <div className="crypto-metrics">
        <div className="metric">
          <span className="metric-label">Vol/Cap</span>
          <span className="metric-value">
            {((currentPrice.volume_24h / currentPrice.market_cap) * 100).toFixed(2)}%
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Dominio</span>
          <span className="metric-value">
            {crypto.symbol === 'BTC' ? '~48%' : '<1%'}
          </span>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className={`chart-btn ${isSelected ? 'active' : ''}`}
          onClick={onSelectChart}
        >
          {isSelected ? '📊 Gráfico activo' : '📈 Ver análisis'}
        </button>
        <button 
          className="details-btn"
          onClick={() => window.open(`https://coinmarketcap.com/currencies/${crypto.slug}/`, '_blank')}
          title="Ver más detalles"
        >
          🔗
        </button>
      </div>
    </div>
  );
}

export default CryptoCard;