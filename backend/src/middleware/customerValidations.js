const { body, param, query } = require('express-validator');

/**
 * Validações para clientes
 */
const customerValidations = {
  // Validação para criação
  create: [
    body('firstName')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('lastName')
      .notEmpty()
      .withMessage('Sobrenome é obrigatório')
      .isLength({ min: 2, max: 50 })
      .withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
      .trim(),
    
    body('email')
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
    body('phone')
      .notEmpty()
      .withMessage('Telefone é obrigatório')
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('cpf')
      .optional()
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)
      .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX ou conter 11 dígitos'),
    
    body('birthDate')
      .optional()
      .isISO8601()
      .withMessage('Data de nascimento deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;
        
        const birthDate = new Date(value);
        const today = new Date();
        
        if (birthDate >= today) {
          throw new Error('Data de nascimento deve ser anterior à data atual');
        }
        
        return true;
      }),
    
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres'),
    
    body('city')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Cidade deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('state')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres')
      .isAlpha()
      .withMessage('Estado deve conter apenas letras'),
    
    body('zipCode')
      .optional()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP deve estar no formato XXXXX-XXX'),
    
    body('emergencyContact')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Contato de emergência deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('emergencyPhone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone de emergência deve ter entre 10 e 20 caracteres'),
    
    body('preferences')
      .optional()
      .isObject()
      .withMessage('Preferências devem ser um objeto JSON'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'bloqueado'])
      .withMessage('Status deve ser ativo, inativo ou bloqueado'),
    
    body('customerSince')
      .optional()
      .isISO8601()
      .withMessage('Data de cadastro deve ser uma data válida'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido')
  ],

  // Validação para atualização
  update: [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve ter entre 2 e 50 caracteres')
      .trim(),

    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
      .trim(),

    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),

    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),

    body('birthDate')
      .optional()
      .isISO8601()
      .withMessage('Data de nascimento deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;

        const birthDate = new Date(value);
        const today = new Date();

        if (birthDate >= today) {
          throw new Error('Data de nascimento deve ser anterior à data atual');
        }

        return true;
      })
  ],

  // Validação de ID
  validateId: [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],

  // Validação de query parameters
  validateQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número maior que 0'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve estar entre 1 e 100'),
    
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Busca deve ter entre 1 e 100 caracteres'),
    
    query('status')
      .optional()
      .isIn(['ativo', 'inativo', 'bloqueado'])
      .withMessage('Status deve ser ativo, inativo ou bloqueado'),
    
    query('company_id')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido'),
    
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Dias deve estar entre 1 e 365')
  ]
};

module.exports = { customerValidations };

