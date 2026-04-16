const express = require('express');
const router = express.Router();
const { getCacheStatus, clearCache } = require('../controllers/cacheController');

router.get('/status', getCacheStatus);
router.delete('/clear', clearCache);

module.exports = router;
