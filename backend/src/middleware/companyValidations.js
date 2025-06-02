const { body, param, query } = require('express-validator');

/**
 * Validações para operações com empresas
 */
const companyValidations = {
  // Validação para criação de empresa
  create: [
    body('name')
      .notEmpty()
      .withMessage('Nome da empresa é obrigatório')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('cnpj')
      .notEmpty()
      .withMessage('CNPJ é obrigatório')
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
      .withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou conter 14 dígitos'),
    
    body('email')
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    
    body('city')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Cidade deve ter no máximo 100 caracteres')
      .trim(),
    
    body('state')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres')
      .trim(),
    
    body('zipCode')
      .optional()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP deve estar no formato XXXXX-XXX'),
    
    body('website')
      .optional()
      .isURL()
      .withMessage('Website deve ser uma URL válida'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres')
      .trim(),
    
    body('settings')
      .optional()
      .isObject()
      .withMessage('Settings deve ser um objeto válido')
  ],

  // Validação para atualização de empresa
  update: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('cnpj')
      .optional()
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
      .withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou conter 14 dígitos'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    
    body('city')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Cidade deve ter no máximo 100 caracteres')
      .trim(),
    
    body('state')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres')
      .trim(),
    
    body('zipCode')
      .optional()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP deve estar no formato XXXXX-XXX'),
    
    body('website')
      .optional()
      .isURL()
      .withMessage('Website deve ser uma URL válida'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres')
      .trim(),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive deve ser um valor booleano'),
    
    body('settings')
      .optional()
      .isObject()
      .withMessage('Settings deve ser um objeto válido')
  ],

  // Validação para parâmetros de ID
  validateId: [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],

  // Validação para query parameters
  validateQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro maior que 0'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Busca deve ter entre 1 e 100 caracteres')
      .trim(),
    
    query('active')
      .optional()
      .isBoolean()
      .withMessage('Active deve ser um valor booleano')
  ]
};

module.exports = { companyValidations };

