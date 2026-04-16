const Cache = require('../models/Cache');

exports.getCacheStatus = async (req, res) => {
    try {
        const count = await Cache.countDocuments();
        res.json({ cachedItems: count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.clearCache = async (req, res) => {
    try {
        await Cache.deleteMany({});
        res.json({ message: 'Cache cleared successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}
