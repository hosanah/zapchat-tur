const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', DashboardController.getStats);

module.exports = router;
