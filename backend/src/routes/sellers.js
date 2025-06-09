const express = require('express');
const router = express.Router();
const SellerController = require('../controllers/SellerController');
const { sellerValidations } = require('../middleware/sellerValidations');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', sellerValidations.validateQuery, SellerController.getAll);
router.post('/', authorize('master', 'admin'), sellerValidations.create, SellerController.create);

module.exports = router;
