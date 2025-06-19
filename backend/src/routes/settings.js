const express = require('express');
const router = express.Router();
const GeneralSettingController = require('../controllers/GeneralSettingController');
const { authenticate } = require('../middleware/auth');
const uploadLogo = require('../middleware/uploadLogo');

router.use(authenticate);

router.get('/', GeneralSettingController.get);
router.put('/', uploadLogo, GeneralSettingController.update);

module.exports = router;
