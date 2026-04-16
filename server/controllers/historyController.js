const Query = require('../models/Query');

exports.getHistory = async (req, res) => {
    try {
        const history = await Query.find().sort({ createdAt: -1 }).limit(20);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
