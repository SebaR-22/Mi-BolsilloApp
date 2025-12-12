const express = require('express');
const router = express.Router();
const { registerUser, magicLinkLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', magicLinkLogin);
router.get('/me', protect, getMe);

module.exports = router;
