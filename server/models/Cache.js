const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
    cacheKey: { type: String, required: true, unique: true, index: true },
    data: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto expire documents after 24 hours
});

module.exports = mongoose.model('Cache', CacheSchema);
