const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, useful if auth is added
    disease: { type: String, required: true },
    query: { type: String, required: true },
    location: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Query', QuerySchema);
