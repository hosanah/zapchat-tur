const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { userValidations } = require('../middleware/userValidations');
const { authenticate, authorize, requireMaster, requireUserAccess } = require('../middleware/auth');

// Aplicar autenticação a todas as rotas
router.use(authenticate);

// Obter perfil do usuário atual
router.get('/profile', 
  UserController.getProfile
);

// Atualizar perfil do usuário atual
router.put('/profile', 
  userValidations.updateProfile,
  UserController.updateProfile
);

// Listar todos os usuários (masters veem todos, outros veem apenas da empresa)
router.get('/', 
  userValidations.validateQuery,
  UserController.getAll
);

// Obter usuário por ID
router.get('/:id', 
  userValidations.validateId,
  UserController.getById
);

// Criar novo usuário (masters podem criar qualquer, outros apenas da empresa)
router.post('/', 
  userValidations.create,
  UserController.create
);

// Atualizar usuário
router.put('/:id', 
  userValidations.validateId,
  userValidations.update,
  requireUserAccess,
  UserController.update
);

// Alterar senha do usuário
router.patch('/:id/change-password', 
  userValidations.validateId,
  userValidations.changePassword,
  requireUserAccess,
  UserController.changePassword
);

// Ativar/Desativar usuário
router.patch('/:id/toggle-status', 
  userValidations.validateId,
  requireUserAccess,
  UserController.toggleStatus
);

// Excluir usuário (soft delete)
router.delete('/:id', 
  userValidations.validateId,
  requireUserAccess,
  UserController.delete
);

module.exports = router;

