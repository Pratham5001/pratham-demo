const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProfile, showEditProfile, updateProfile, getPublicProfile } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.get('/profile/edit', protect, showEditProfile);
router.post('/profile/edit', protect, upload.single('avatar'), updateProfile);
router.get('/:id', getPublicProfile);

module.exports = router;
