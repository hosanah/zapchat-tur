const { body, param } = require('express-validator');

const saleAccessoryValidations = {
  list: [param('id').isUUID().withMessage('ID da venda deve ser um UUID válido')],
  create: [
    param('id').isUUID().withMessage('ID da venda deve ser um UUID válido'),
    body('accessory_id')
      .notEmpty().withMessage('Acessório é obrigatório')
      .isUUID().withMessage('ID do acessório inválido'),
    body('quantity')
      .optional()
      .isInt({ min: 1 }).withMessage('Quantidade deve ser pelo menos 1')
  ],
  remove: [
    param('id').isUUID().withMessage('ID da venda deve ser um UUID válido'),
    param('sale_accessory_id').isUUID().withMessage('ID inválido')
  ]
};

module.exports = saleAccessoryValidations;
