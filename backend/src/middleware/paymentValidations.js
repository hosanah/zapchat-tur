const { body, param } = require('express-validator');

const methods = [
  'dinheiro',
  'cartao_credito',
  'cartao_debito',
  'pix',
  'transferencia',
  'boleto',
  'cheque',
  'outro'
];

const paymentValidations = {
  list: [
    param('id').isUUID().withMessage('ID da venda deve ser um UUID válido')
  ],
  create: [
    param('id').isUUID().withMessage('ID da venda deve ser um UUID válido'),
    body('amount')
      .notEmpty().withMessage('Valor é obrigatório')
      .isFloat({ gt: 0 }).withMessage('Valor deve ser positivo'),
    body('payment_method')
      .notEmpty().withMessage('Método é obrigatório')
      .isIn(methods).withMessage('Método de pagamento inválido'),
    body('payment_date')
      .optional()
      .isISO8601().withMessage('Data de pagamento inválida'),
    body('notes')
      .optional()
      .isLength({ max: 1000 }).withMessage('Observações deve ter no máximo 1000 caracteres')
  ],
  remove: [
    param('id').isUUID().withMessage('ID da venda deve ser um UUID válido'),
    param('payment_id').isUUID().withMessage('ID do pagamento deve ser um UUID válido')
  ]
};

module.exports = paymentValidations;
