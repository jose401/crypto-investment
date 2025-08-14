# CryptoInvestment - Sistema de Monitoreo de Criptomonedas

Sistema profesional de monitoreo de criptomonedas en tiempo real con análisis técnico y gráficos interactivos.

## 🚀 Características Principales

- ✅ Monitoreo en tiempo real de criptomonedas
- ✅ Gráficos interactivos con múltiples vistas
- ✅ Actualización automática sin recargar página
- ✅ Persistencia de datos históricos
- ✅ Diseño responsive para todos los dispositivos
- ✅ Tema claro/oscuro
- ✅ Análisis técnico básico

## 📋 Requisitos del Sistema

- Node.js v14 o superior
- MySQL 5.7 o superior
- Cuenta en CoinMarketCap para API Key (gratuita)

## 🔧 Instalación

### 1. Clonar el repositorio
bash
git clone https://github.com/tu-usuario/crypto-investment.git

cd crypto-investment

## 2. Configurar Base de Datos
Ejecutar el script SQL en MySQL:
bashmysql -u root -p < database/schema.sql

## 3. Configurar Backend
bashcd backend
npm install
cp .env.example .env

# Editar .env con tus credenciales
npm run dev

## 4. Configurar Frontend
bashcd ../frontend
npm install
npm start

🏗️ Arquitectura
Backend (Node.js + Express)

Patrón MVC
API REST
Integración con CoinMarketCap API
Actualizaciones programadas con node-cron
Pool de conexiones MySQL

Frontend (React.js)

Componentes funcionales con Hooks
Gestión de estado con useState
Gráficos con Recharts
Diseño responsive con CSS Grid/Flexbox
Sistema de temas dinámico

📊 Modelo de Base de Datos
El sistema utiliza 3 tablas principales:

cryptocurrencies: Información básica de criptomonedas
price_history: Historial de precios y volumen
selected_cryptocurrencies: Criptomonedas en seguimiento

🛠️ Tecnologías Utilizadas

Backend: Node.js, Express, MySQL, Axios, Node-cron
Frontend: React, Recharts, Axios, CSS3
API: CoinMarketCap API v1

👨‍💻 Autor
José Alberto Bahena Sosa
📄 Licencia
Este proyecto fue desarrollado como parte de un examen práctico.
