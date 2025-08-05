import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;