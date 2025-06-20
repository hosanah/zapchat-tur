const express = require('express');
const router = express.Router();
const AccessoryController = require('../controllers/AccessoryController');
const { accessoryValidations } = require('../middleware/accessoryValidations');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', AccessoryController.getAll);
router.get('/:id', accessoryValidations.validateId, AccessoryController.getById);
router.post('/', authorize('admin','master'), accessoryValidations.create, AccessoryController.create);
router.put('/:id', authorize('admin','master'), accessoryValidations.validateId, accessoryValidations.update, AccessoryController.update);
router.delete('/:id', authorize('admin','master'), accessoryValidations.validateId, AccessoryController.delete);

module.exports = router;
