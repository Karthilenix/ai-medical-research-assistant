const Session = require('../models/Session');

exports.getUserSessions = async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await Session.find({ user: userId }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};

exports.getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch session' });
    }
};

exports.saveSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, title, conversation, diseaseContext } = req.body;
        
        let session;
        if (id && id !== 'new') {
            session = await Session.findByIdAndUpdate(
                id, 
                { title, conversation, diseaseContext, updatedAt: Date.now() },
                { new: true }
            );
        } else {
            session = await Session.create({
                user: userId,
                title,
                conversation,
                diseaseContext
            });
        }
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save session' });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        await Session.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
};
