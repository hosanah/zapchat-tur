const express = require('express');
const router = express.Router();
const GeneralSettingController = require('../controllers/GeneralSettingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', GeneralSettingController.get);
router.put('/', GeneralSettingController.update);

module.exports = router;
