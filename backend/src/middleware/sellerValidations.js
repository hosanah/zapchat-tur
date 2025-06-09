const { body, param, query } = require('express-validator');

const sellerValidations = {
  create: [
    body('firstName')
      .notEmpty().withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres')
      .trim(),
    body('lastName')
      .notEmpty().withMessage('Sobrenome é obrigatório')
      .isLength({ min: 2, max: 50 }).withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
      .trim()
  ],
  update: [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres')
      .trim(),
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
      .trim()
  ],
  validateId: [
    param('id').isUUID().withMessage('ID deve ser um UUID válido')
  ],
  validateQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número maior que 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Busca deve ter entre 1 e 100 caracteres')
  ]
};

module.exports = { sellerValidations };
