const express = require('express');
const router = express.Router();
const { getUserSessions, getSession, saveSession, deleteSession } = require('../controllers/sessionController');

router.get('/user/:userId', getUserSessions);
router.get('/:id', getSession);
router.post('/:id', saveSession);
router.delete('/:id', deleteSession);

module.exports = router;
