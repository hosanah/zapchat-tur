const { body, param } = require('express-validator');

const accessoryValidations = {
  create: [
    body('name').notEmpty().withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('value').notEmpty().withMessage('Valor é obrigatório')
      .isFloat({ min: 0 }).withMessage('Valor deve ser positivo'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Descrição muito longa'),
    body('company_id').optional().isUUID().withMessage('Empresa inválida')
  ],
  update: [
    body('name').optional().isLength({ min: 2, max: 100 }),
    body('value').optional().isFloat({ min: 0 }),
    body('description').optional().isLength({ max: 1000 })
  ],
  validateId: [param('id').isUUID().withMessage('ID inválido')]
};

module.exports = { accessoryValidations };
