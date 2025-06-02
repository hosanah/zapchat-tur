const { body, param, query } = require('express-validator');

/**
 * Validações para motoristas
 */
const driverValidations = {
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
    
    body('cpf')
      .notEmpty()
      .withMessage('CPF é obrigatório')
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)
      .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX ou conter 11 dígitos'),
    
    body('rg')
      .optional()
      .isLength({ min: 5, max: 20 })
      .withMessage('RG deve ter entre 5 e 20 caracteres'),
    
    body('birthDate')
      .notEmpty()
      .withMessage('Data de nascimento é obrigatória')
      .isISO8601()
      .withMessage('Data de nascimento deve ser uma data válida')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 18) {
          throw new Error('Motorista deve ter pelo menos 18 anos');
        }
        
        if (age > 100) {
          throw new Error('Data de nascimento inválida');
        }
        
        return true;
      }),
    
    body('phone')
      .notEmpty()
      .withMessage('Telefone é obrigatório')
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
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
    
    body('licenseNumber')
      .notEmpty()
      .withMessage('Número da CNH é obrigatório')
      .isLength({ min: 5, max: 20 })
      .withMessage('Número da CNH deve ter entre 5 e 20 caracteres'),
    
    body('licenseCategory')
      .notEmpty()
      .withMessage('Categoria da CNH é obrigatória')
      .isIn(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'])
      .withMessage('Categoria deve ser A, B, C, D, E, AB, AC, AD ou AE'),
    
    body('licenseExpiry')
      .notEmpty()
      .withMessage('Validade da CNH é obrigatória')
      .isISO8601()
      .withMessage('Validade da CNH deve ser uma data válida')
      .custom((value) => {
        const expiryDate = new Date(value);
        const today = new Date();
        
        if (expiryDate <= today) {
          throw new Error('CNH deve estar válida');
        }
        
        return true;
      }),
    
    body('emergencyContact')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Contato de emergência deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('emergencyPhone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone de emergência deve ter entre 10 e 20 caracteres'),
    
    body('hireDate')
      .optional()
      .isISO8601()
      .withMessage('Data de contratação deve ser uma data válida'),
    
    body('salary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Salário não pode ser negativo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
      .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('observations')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres'),
    
    body('companyId')
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
    
    body('cpf')
      .optional()
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)
      .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX ou conter 11 dígitos'),
    
    body('rg')
      .optional()
      .isLength({ min: 5, max: 20 })
      .withMessage('RG deve ter entre 5 e 20 caracteres'),
    
    body('birthDate')
      .optional()
      .isISO8601()
      .withMessage('Data de nascimento deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;
        
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 18) {
          throw new Error('Motorista deve ter pelo menos 18 anos');
        }
        
        if (age > 100) {
          throw new Error('Data de nascimento inválida');
        }
        
        return true;
      }),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
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
    
    body('licenseNumber')
      .optional()
      .isLength({ min: 5, max: 20 })
      .withMessage('Número da CNH deve ter entre 5 e 20 caracteres'),
    
    body('licenseCategory')
      .optional()
      .isIn(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'])
      .withMessage('Categoria deve ser A, B, C, D, E, AB, AC, AD ou AE'),
    
    body('licenseExpiry')
      .optional()
      .isISO8601()
      .withMessage('Validade da CNH deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;
        
        const expiryDate = new Date(value);
        const today = new Date();
        
        if (expiryDate <= today) {
          throw new Error('CNH deve estar válida');
        }
        
        return true;
      }),
    
    body('emergencyContact')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Contato de emergência deve ter entre 2 e 100 caracteres')
      .trim(),
    
    body('emergencyPhone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone de emergência deve ter entre 10 e 20 caracteres'),
    
    body('hireDate')
      .optional()
      .isISO8601()
      .withMessage('Data de contratação deve ser uma data válida'),
    
    body('salary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Salário não pode ser negativo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
      .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    body('observations')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres')
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
      .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
      .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
    
    query('category')
      .optional()
      .isIn(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'])
      .withMessage('Categoria deve ser A, B, C, D, E, AB, AC, AD ou AE'),
    
    query('companyId')
      .optional()
      .isUUID()
      .withMessage('ID da empresa deve ser um UUID válido'),
    
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Dias deve estar entre 1 e 365')
  ]
};

module.exports = { driverValidations };

