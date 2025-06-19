const express = require('express');
const router = express.Router();
const GeneralSettingController = require('../controllers/GeneralSettingController');
const { authenticate } = require('../middleware/auth');
const uploadLogo = require('../middleware/uploadLogo');
const generalSettingValidations = require('../middleware/generalSettingValidations');

router.use(authenticate);

router.get('/', GeneralSettingController.get);
router.put('/', uploadLogo, GeneralSettingController.update);
router.post('/', generalSettingValidations.create, GeneralSettingController.create);
router.put('/', generalSettingValidations.update, GeneralSettingController.update);
router.delete('/', GeneralSettingController.delete);

module.exports = router;
