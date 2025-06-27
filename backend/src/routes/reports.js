const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/sales', ReportController.salesReport);
router.get('/daily-trips', ReportController.dailyTrips);
router.get('/seller-productivity', ReportController.sellerProductivity);
router.get('/financial', ReportController.financialReport);

module.exports = router;
