const express = require('express');
const router = express.Router();
const SellerController = require('../controllers/SellerController');
const { sellerValidations } = require('../middleware/sellerValidations');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', sellerValidations.validateQuery, SellerController.getAll);
router.get('/:id', sellerValidations.validateId, SellerController.getById);
router.post('/', authorize('master', 'admin'), sellerValidations.create, SellerController.create);
router.put('/:id', authorize('master', 'admin'), sellerValidations.validateId, sellerValidations.update, SellerController.update);
router.delete('/:id', authorize('master', 'admin'), sellerValidations.validateId, SellerController.delete);

module.exports = router;
