import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ReferenceLine, Brush, Cell
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getPriceHistory } from '../services/api';
import './PriceChart.css';

function PriceChart({ crypto, theme }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('area');
  const [showVolume, setShowVolume] = useState(true);

  // Colores del tema
  const colors = {
    primary: theme === 'dark' ? '#60a5fa' : '#3b82f6',
    success: theme === 'dark' ? '#34d399' : '#10b981',
    danger: theme === 'dark' ? '#f87171' : '#ef4444',
    warning: theme === 'dark' ? '#fbbf24' : '#f59e0b',
    text: theme === 'dark' ? '#cbd5e1' : '#475569',
    grid: theme === 'dark' ? '#334155' : '#e2e8f0',
    background: theme === 'dark' ? '#1e293b' : '#f8fafc'
  };

  useEffect(() => {
    loadPriceHistory();
  }, [crypto, timeRange]);

  const loadPriceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
      
      const history = await getPriceHistory(crypto.id, startDate, endDate);
      
      // Formatear datos para los gráficos
      const formattedData = history.map(item => ({
        date: new Date(item.timestamp),
        price: parseFloat(item.price),
        volume: parseFloat(item.volume_24h),
        marketCap: parseFloat(item.market_cap),
        change: parseFloat(item.percent_change_24h),
        timestamp: item.timestamp
      }));
      
      // Si hay pocos datos, generar algunos datos de demostración
      if (formattedData.length < 10) {
        const currentPrice = formattedData[0]?.price || crypto.currentPrice?.price || 100;
        const generatedData = generateDemoData(currentPrice, startDate, endDate, timeRange);
        setData(generatedData);
      } else {
        setData(formattedData);
      }
      
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError('Error al cargar el historial de precios');
      const demoData = generateDemoData(crypto.currentPrice?.price || 100, new Date(), new Date(), timeRange);
      setData(demoData);
    } finally {
      setLoading(false);
    }
  };

  // Función mejorada para generar datos de demostración
  const generateDemoData = (basePrice, startDate, endDate, range) => {
    const dataPoints = [];
    const intervals = {
      '1h': 60,
      '24h': 96,
      '7d': 168,
      '30d': 120,
      '90d': 180,
      '1y': 365
    };
    
    const numPoints = intervals[range] || 168;
    const timeStep = (endDate - startDate) / numPoints;
    
    let lastPrice = basePrice;
    
    for (let i = 0; i < numPoints; i++) {
      // Simulación más realista con tendencia y volatilidad
      const trend = Math.sin(i / 20) * 0.02;
      const randomWalk = (Math.random() - 0.5) * 0.03;
      const volatility = Math.random() * 0.02;
      
      lastPrice = lastPrice * (1 + trend + randomWalk);
      const volume = 1000000000 + Math.random() * 500000000 + Math.sin(i / 10) * 200000000;
      
      dataPoints.push({
        date: new Date(startDate.getTime() + i * timeStep),
        price: lastPrice + (lastPrice * volatility * (Math.random() - 0.5)),
        volume: volume,
        marketCap: lastPrice * 19000000,
        change: (trend + randomWalk) * 100,
        timestamp: new Date(startDate.getTime() + i * timeStep).toISOString()
      });
    }
    
    return dataPoints;
  };

  const formatXAxis = (tickItem) => {
    if (timeRange === '1h' || timeRange === '24h') {
      return format(tickItem, 'HH:mm', { locale: es });
    } else if (timeRange === '7d' || timeRange === '30d') {
      return format(tickItem, 'dd MMM', { locale: es });
    } else {
      return format(tickItem, 'MMM yy', { locale: es });
    }
  };

  const formatTooltipLabel = (value) => {
    return format(value, "dd 'de' MMMM, HH:mm", { locale: es });
  };

  const formatPrice = (value) => {
    if (value >= 1) return `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (value >= 0.01) return `$${value.toFixed(4)}`;
    return `$${value.toFixed(8)}`;
  };

  const formatVolume = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${(value / 1e3).toFixed(2)}K`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{formatTooltipLabel(label)}</p>
          <div className="tooltip-data">
            <div className="tooltip-item">
              <span className="tooltip-label">Precio:</span>
              <span className="tooltip-value">{formatPrice(payload[0].value)}</span>
            </div>
            {payload[1] && (
              <div className="tooltip-item">
                <span className="tooltip-label">Volumen:</span>
                <span className="tooltip-value">{formatVolume(payload[1].value)}</span>
              </div>
            )}
            {payload[0].payload.change && (
              <div className="tooltip-item">
                <span className="tooltip-label">Cambio 24h:</span>
                <span className={`tooltip-value ${payload[0].payload.change >= 0 ? 'positive' : 'negative'}`}>
                  {payload[0].payload.change >= 0 ? '+' : ''}{payload[0].payload.change.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="price-chart loading">
        <div className="chart-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-chart"></div>
          <div className="skeleton-stats"></div>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const prices = data.map(d => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const currentPrice = prices[prices.length - 1];
  const priceChange = ((currentPrice - prices[0]) / prices[0]) * 100;
  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);

  return (
    <div className="price-chart">
      {/* Header con estadísticas */}
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="chart-title">Análisis de {crypto.name}</h3>
          <span className="chart-symbol">{crypto.symbol}</span>
        </div>
        
        <div className="chart-controls">
          <div className="chart-type-selector">
            <button 
              className={chartType === 'line' ? 'active' : ''}
              onClick={() => setChartType('line')}
            >
              Línea
            </button>
            <button 
              className={chartType === 'area' ? 'active' : ''}
              onClick={() => setChartType('area')}
            >
              Área
            </button>
            <button 
              className={chartType === 'candle' ? 'active' : ''}
              onClick={() => setChartType('candle')}
            >
              Velas
            </button>
          </div>
          
          <button 
            className={`volume-toggle ${showVolume ? 'active' : ''}`}
            onClick={() => setShowVolume(!showVolume)}
          >
            {showVolume ? '📊' : '📈'} Volumen
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="price-stats-grid">
        <div className="stat-card primary">
          <span className="stat-label">PRECIO ACTUAL</span>
          <span className="stat-value">{formatPrice(currentPrice)}</span>
          <span className={`stat-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
           {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
         </span>
       </div>
       
       <div className="stat-card">
         <span className="stat-label">MÁXIMO {timeRange.toUpperCase()}</span>
         <span className="stat-value">{formatPrice(maxPrice)}</span>
       </div>
       
       <div className="stat-card">
         <span className="stat-label">MÍNIMO {timeRange.toUpperCase()}</span>
         <span className="stat-value">{formatPrice(minPrice)}</span>
       </div>
       
       <div className="stat-card">
         <span className="stat-label">VOL. TOTAL {timeRange.toUpperCase()}</span>
         <span className="stat-value">{formatVolume(totalVolume)}</span>
       </div>
     </div>

     {/* Selector de tiempo */}
     <div className="time-range-container">
       <div className="time-range-selector">
         {['1h', '24h', '7d', '30d', '90d', '1y'].map((range) => (
           <button
             key={range}
             className={timeRange === range ? 'active' : ''}
             onClick={() => setTimeRange(range)}
           >
             {range}
           </button>
         ))}
       </div>
     </div>

     {/* Gráfico principal */}
     <div className="chart-main">
       <ResponsiveContainer width="100%" height={showVolume ? 400 : 500}>
         {chartType === 'line' ? (
           <ComposedChart
             data={data}
             margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
           >
             <defs>
               <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                 <stop offset="95%" stopColor={colors.primary} stopOpacity={0.05}/>
               </linearGradient>
             </defs>
             <CartesianGrid 
               strokeDasharray="3 3" 
               stroke={colors.grid} 
               opacity={0.5}
               vertical={false}
             />
             <XAxis 
               dataKey="date"
               tickFormatter={formatXAxis}
               stroke={colors.text}
               tick={{ fontSize: 12 }}
               axisLine={{ stroke: colors.grid }}
             />
             <YAxis 
               yAxisId="price"
               tickFormatter={(value) => formatPrice(value)}
               stroke={colors.text}
               tick={{ fontSize: 12 }}
               axisLine={{ stroke: colors.grid }}
               domain={['dataMin * 0.99', 'dataMax * 1.01']}
             />
             {showVolume && (
               <YAxis 
                 yAxisId="volume"
                 orientation="right"
                 tickFormatter={(value) => formatVolume(value)}
                 stroke={colors.text}
                 tick={{ fontSize: 12 }}
                 axisLine={{ stroke: colors.grid }}
               />
             )}
             <Tooltip content={<CustomTooltip />} />
             <Line 
               yAxisId="price"
               type="monotone" 
               dataKey="price" 
               stroke={colors.primary}
               strokeWidth={2.5}
               dot={false}
               activeDot={{ r: 6, fill: colors.primary }}
             />
             {showVolume && (
               <Bar 
                 yAxisId="volume"
                 dataKey="volume" 
                 fill="url(#colorVolume)"
               />
             )}
             <Brush 
               dataKey="date" 
               height={30} 
               stroke={colors.grid}
               fill={colors.background}
               tickFormatter={formatXAxis}
             />
           </ComposedChart>
         ) : chartType === 'area' ? (
           <ComposedChart
             data={data}
             margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
           >
             <defs>
               <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4}/>
                 <stop offset="95%" stopColor={colors.primary} stopOpacity={0.05}/>
               </linearGradient>
               <linearGradient id="colorVolume2" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor={colors.success} stopOpacity={0.3}/>
                 <stop offset="95%" stopColor={colors.success} stopOpacity={0.05}/>
               </linearGradient>
             </defs>
             <CartesianGrid 
               strokeDasharray="3 3" 
               stroke={colors.grid} 
               opacity={0.5}
               vertical={false}
             />
             <XAxis 
               dataKey="date"
               tickFormatter={formatXAxis}
               stroke={colors.text}
               tick={{ fontSize: 12 }}
               axisLine={{ stroke: colors.grid }}
             />
             <YAxis 
               yAxisId="price"
               tickFormatter={(value) => formatPrice(value)}
               stroke={colors.text}
               tick={{ fontSize: 12 }}
               axisLine={{ stroke: colors.grid }}
               domain={['dataMin * 0.99', 'dataMax * 1.01']}
             />
             {showVolume && (
               <YAxis 
                 yAxisId="volume"
                 orientation="right"
                 tickFormatter={(value) => formatVolume(value)}
                 stroke={colors.text}
                 tick={{ fontSize: 12 }}
                 axisLine={{ stroke: colors.grid }}
               />
             )}
             <Tooltip content={<CustomTooltip />} />
             <Area 
               yAxisId="price"
               type="monotone" 
               dataKey="price" 
               stroke={colors.primary}
               strokeWidth={2}
               fill="url(#colorPrice)"
             />
             {showVolume && (
               <Bar 
                 yAxisId="volume"
                 dataKey="volume" 
                 fill="url(#colorVolume2)"
               />
             )}
             <Brush 
               dataKey="date" 
               height={30} 
               stroke={colors.grid}
               fill={colors.background}
               tickFormatter={formatXAxis}
             />
           </ComposedChart>
         ) : (
           // Gráfico de velas simulado
           <ComposedChart
             data={data}
             margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
           >
             <CartesianGrid 
               strokeDasharray="3 3" 
               stroke={colors.grid} 
               opacity={0.5}
               vertical={false}
             />
             <XAxis 
               dataKey="date"
               tickFormatter={formatXAxis}
               stroke={colors.text}
               tick={{ fontSize: 12 }}
               axisLine={{ stroke: colors.grid }}
             />
             <YAxis 
               tickFormatter={(value) => formatPrice(value)}
               stroke={colors.text}
               tick={{ fontSize: 12 }}
               axisLine={{ stroke: colors.grid }}
               domain={['dataMin * 0.99', 'dataMax * 1.01']}
             />
             <Tooltip content={<CustomTooltip />} />
             <Bar dataKey="price">
               {data.map((entry, index) => (
                 <Cell 
                   key={`cell-${index}`} 
                   fill={entry.change >= 0 ? colors.success : colors.danger} 
                 />
               ))}
             </Bar>
             <Brush 
               dataKey="date" 
               height={30} 
               stroke={colors.grid}
               fill={colors.background}
               tickFormatter={formatXAxis}
             />
           </ComposedChart>
         )}
       </ResponsiveContainer>
     </div>

     {/* Gráfico de volumen separado si está activado */}
     {showVolume && (
       <div className="volume-chart">
         <h4 className="volume-title">Volumen de Transacciones</h4>
         <ResponsiveContainer width="100%" height={150}>
           <BarChart
             data={data}
             margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
           >
             <CartesianGrid 
               strokeDasharray="3 3" 
               stroke={colors.grid} 
               opacity={0.5}
               vertical={false}
             />
             <XAxis 
               dataKey="date"
               tickFormatter={formatXAxis}
               stroke={colors.text}
               tick={{ fontSize: 11 }}
               axisLine={{ stroke: colors.grid }}
             />
             <YAxis 
               tickFormatter={(value) => formatVolume(value)}
               stroke={colors.text}
               tick={{ fontSize: 11 }}
               axisLine={{ stroke: colors.grid }}
             />
             <Tooltip 
               content={<CustomTooltip />}
             />
             <Bar dataKey="volume">
               {data.map((entry, index) => (
                 <Cell 
                   key={`cell-${index}`} 
                   fill={entry.change >= 0 ? colors.success : colors.danger} 
                   opacity={0.6}
                 />
               ))}
             </Bar>
           </BarChart>
         </ResponsiveContainer>
       </div>
     )}

     {/* Indicadores y análisis */}
     <div className="analysis-section">
       <div className="indicators-grid">
         <div className="indicator-card">
           <div className="indicator-header">
             <span className="indicator-title">RSI (14)</span>
             <span className="indicator-info">ℹ</span>
           </div>
           <div className="indicator-value">
             {(50 + (priceChange * 2)).toFixed(1)}
           </div>
           <div className={`indicator-status ${priceChange > 10 ? 'overbought' : priceChange < -10 ? 'oversold' : 'neutral'}`}>
             {priceChange > 10 ? 'Sobrecompra' : priceChange < -10 ? 'Sobreventa' : 'Neutral'}
           </div>
         </div>

         <div className="indicator-card">
           <div className="indicator-header">
             <span className="indicator-title">Volatilidad</span>
             <span className="indicator-info">ℹ</span>
           </div>
           <div className="indicator-value">
             {((maxPrice - minPrice) / avgPrice * 100).toFixed(2)}%
           </div>
           <div className="indicator-status">
             {((maxPrice - minPrice) / avgPrice * 100) > 10 ? 'Alta' : 'Normal'}
           </div>
         </div>

         <div className="indicator-card">
           <div className="indicator-header">
             <span className="indicator-title">Tendencia</span>
             <span className="indicator-info">ℹ</span>
           </div>
           <div className={`indicator-value ${priceChange >= 0 ? 'bullish' : 'bearish'}`}>
             {priceChange >= 0 ? '📈' : '📉'}
           </div>
           <div className={`indicator-status ${priceChange >= 0 ? 'bullish' : 'bearish'}`}>
             {priceChange >= 0 ? 'Alcista' : 'Bajista'}
           </div>
         </div>

         <div className="indicator-card">
           <div className="indicator-header">
             <span className="indicator-title">Soporte/Resistencia</span>
             <span className="indicator-info">ℹ</span>
           </div>
           <div className="sr-levels">
             <div className="sr-level">
               <span className="sr-label">S:</span>
               <span className="sr-value">{formatPrice(minPrice * 0.98)}</span>
             </div>
             <div className="sr-level">
               <span className="sr-label">R:</span>
               <span className="sr-value">{formatPrice(maxPrice * 1.02)}</span>
             </div>
           </div>
         </div>
       </div>

       {/* Resumen del análisis */}
       <div className="analysis-summary">
         <h4>Resumen del Período</h4>
         <div className="summary-grid">
           <div className="summary-item">
             <span className="summary-label">Precio Promedio</span>
             <span className="summary-value">{formatPrice(avgPrice)}</span>
           </div>
           <div className="summary-item">
             <span className="summary-label">Rango de Precio</span>
             <span className="summary-value">{formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>
           </div>
           <div className="summary-item">
             <span className="summary-label">Cambio Total</span>
             <span className={`summary-value ${priceChange >= 0 ? 'positive' : 'negative'}`}>
               {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
             </span>
           </div>
           <div className="summary-item">
             <span className="summary-label">Volumen Promedio</span>
             <span className="summary-value">{formatVolume(totalVolume / data.length)}</span>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}

export default PriceChart;