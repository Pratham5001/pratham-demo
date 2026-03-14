const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversations, getChat, sendMessage } = require('../controllers/messageController');

router.get('/', protect, getConversations);
router.get('/:userId', protect, getChat);
router.post('/:userId/send', protect, sendMessage);

module.exports = router;
