const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/pdf', protect, generateReport);

module.exports = router;
