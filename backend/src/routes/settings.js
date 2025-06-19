const express = require('express');
const router = express.Router();
const GeneralSettingController = require('../controllers/GeneralSettingController');
const { authenticate } = require('../middleware/auth');
const generalSettingValidations = require('../middleware/generalSettingValidations');

router.use(authenticate);

router.get('/', GeneralSettingController.get);
router.post('/', generalSettingValidations.create, GeneralSettingController.create);
router.put('/', generalSettingValidations.update, GeneralSettingController.update);
router.delete('/', GeneralSettingController.delete);

module.exports = router;
