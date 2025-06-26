const { body } = require('express-validator');

const generalSettingValidations = {
  create: [
    body('logo')
      .optional({ nullable: true })
      .isBase64()
      .withMessage('Logo deve estar em Base64'),
    body('guidelines')
      .optional({ nullable: true })
      .isString()
      .withMessage('Guidelines deve ser um texto')
  ],
  update: [
    body('guidelines')
      .optional({ nullable: true })
      .isString()
      .withMessage('Guidelines deve ser um texto')
  ]
};

module.exports = generalSettingValidations;
