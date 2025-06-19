const { body, param } = require('express-validator');

const notificationValidations = {
  create: [
    body('message')
      .notEmpty()
      .withMessage('Mensagem é obrigatória'),
    body('user_id')
      .optional()
      .isUUID()
      .withMessage('ID do usuário deve ser um UUID válido')
  ],
  validateId: [
    param('id').isUUID().withMessage('ID deve ser um UUID válido')
  ]
};

module.exports = notificationValidations;
