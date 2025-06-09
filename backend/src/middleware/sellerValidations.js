const { body, query, param } = require('express-validator');

const sellerValidations = {
  create: [
    body('firstName').notEmpty().isLength({ min: 2, max: 50 }),
    body('lastName').notEmpty().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail(),
    body('phone').optional().isLength({ min: 10, max: 20 }),
    body('company_id').optional().isUUID()
  ],
  validateQuery: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ],
  validateId: [param('id').isUUID()]
};

module.exports = { sellerValidations };
