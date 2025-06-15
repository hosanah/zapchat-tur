const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/ActivityController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/recent', ActivityController.getRecent);

module.exports = router;
