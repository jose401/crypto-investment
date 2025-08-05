const express = require('express');
const router = express.Router();
const cryptocurrencyController = require('../controllers/cryptocurrencyController');

// Rutas de criptomonedas
router.get('/search', cryptocurrencyController.search);
router.get('/selected', cryptocurrencyController.getSelected);
router.post('/watchlist', cryptocurrencyController.addToWatchlist);
router.delete('/watchlist/:id', cryptocurrencyController.removeFromWatchlist);
router.get('/history/:id', cryptocurrencyController.getPriceHistory);

module.exports = router;