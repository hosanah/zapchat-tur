const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/CompanyController');
const { companyValidations } = require('../middleware/companyValidations');
const { authenticate, authorize, requireMaster } = require('../middleware/auth');

// Aplicar autenticação a todas as rotas
router.use(authenticate);

// Listar todas as empresas (apenas masters podem ver todas)
router.get('/', 
  companyValidations.validateQuery,
  CompanyController.getAll
);

// Obter empresa por ID
router.get('/:id', 
  companyValidations.validateId,
  CompanyController.getById
);

// Obter estatísticas da empresa
router.get('/:id/stats', 
  companyValidations.validateId,
  CompanyController.getStats
);

// Criar nova empresa (apenas masters)
router.post('/', 
  requireMaster,
  companyValidations.create,
  CompanyController.create
);

// Atualizar empresa (apenas masters)
router.put('/:id', 
  requireMaster,
  companyValidations.validateId,
  companyValidations.update,
  CompanyController.update
);

// Ativar/Desativar empresa (apenas masters)
router.patch('/:id/toggle-status', 
  requireMaster,
  companyValidations.validateId,
  CompanyController.toggleStatus
);

// Excluir empresa (apenas masters)
router.delete('/:id', 
  requireMaster,
  companyValidations.validateId,
  CompanyController.delete
);

module.exports = router;

