const { User, Company, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Controlador para operações com usuários
 */
class UserController {
  /**
   * Listar todos os usuários
   * GET /api/users
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, role, active, company_id } = req.query;
      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {};
      
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (active !== undefined) {
        where.isActive = active === 'true';
      }

      if (company_id) {
        where.company_id = company_id;
      }

      // Verificar se usuário pode ver todos os usuários ou apenas da sua empresa
      const currentUser = req.user;
      if (currentUser && !currentUser.isMaster()) {
        where.company_id = currentUser.company_id;
      }

      const { count, rows: users } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter usuário por ID
   * GET /api/users/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'email', 'cnpj']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar se usuário pode ver este usuário
      const currentUser = req.user;
      if (currentUser && !currentUser.isMaster() && user.company_id !== currentUser.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo usuário
   * POST /api/users
   */
  static async create(req, res, next) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const userData = req.body;

      // Verificar se email já existe
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email já está cadastrado'
        });
      }

      // Verificar se empresa existe (para usuários não-master)
      if (userData.role !== 'master' && req.user.company_id) {
        const company = await Company.findByPk(req.user.company_id);
        if (!company) {
          return res.status(400).json({
            success: false,
            error: 'Empresa não encontrada'
          });
        }
      }

      // Verificar permissões para criar usuário master
      const currentUser = req.user;
      if (userData.role === 'master' && currentUser && !currentUser.isMaster()) {
        return res.status(403).json({
          success: false,
          error: 'Apenas usuários master podem criar outros usuários master'
        });
      }

      // Verificar se usuário não-master está criando usuário para sua empresa
      if (currentUser && !currentUser.isMaster() && req.user.company_id !== currentUser.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Você só pode criar usuários para sua própria empresa'
        });
      }

      userData.company_id = req.user.company_id;

      const user = await User.create(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar usuário
   * PUT /api/users/:id
   */
  static async update(req, res, next) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar permissões
      const currentUser = req.user;
      if (currentUser && !currentUser.isMaster() && user.company_id !== currentUser.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se email já existe (exceto para o usuário atual)
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findByEmail(updateData.email);
        if (existingUser && existingUser.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Email já está cadastrado'
          });
        }
      }

      // Verificar se empresa existe (para usuários não-master)
      if (updateData.company_id && updateData.role !== 'master') {
        const company = await Company.findByPk(updateData.company_id);
        if (!company) {
          return res.status(400).json({
            success: false,
            error: 'Empresa não encontrada'
          });
        }
      }

      // Verificar permissões para alterar role para master
      if (updateData.role === 'master' && user.role !== 'master' && currentUser && !currentUser.isMaster()) {
        return res.status(403).json({
          success: false,
          error: 'Apenas usuários master podem promover outros usuários a master'
        });
      }

      await user.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir usuário (soft delete)
   * DELETE /api/users/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar permissões
      const currentUser = req.user;
      if (currentUser && !currentUser.isMaster() && user.company_id !== currentUser.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Não permitir que usuário exclua a si mesmo
      if (currentUser && currentUser.id === id) {
        return res.status(400).json({
          success: false,
          error: 'Você não pode excluir sua própria conta'
        });
      }

      // Soft delete - apenas marcar como inativo
      await user.update({ isActive: false });

      res.status(200).json({
        success: true,
        message: 'Usuário desativado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ativar/Desativar usuário
   * PATCH /api/users/:id/toggle-status
   */
  static async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar permissões
      const currentUser = req.user;
      if (currentUser && !currentUser.isMaster() && user.company_id !== currentUser.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Não permitir que usuário desative a si mesmo
      if (currentUser && currentUser.id === id) {
        return res.status(400).json({
          success: false,
          error: 'Você não pode desativar sua própria conta'
        });
      }

      const newStatus = !user.isActive;
      await user.update({ isActive: newStatus });

      res.status(200).json({
        success: true,
        message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar senha do usuário
   * PATCH /api/users/:id/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Senha atual e nova senha são obrigatórias'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Nova senha deve ter pelo menos 6 caracteres'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar permissões
      const currentUser = req.user;
      if (currentUser && currentUser.id !== id && !currentUser.isMaster()) {
        return res.status(403).json({
          success: false,
          error: 'Você só pode alterar sua própria senha'
        });
      }

      // Verificar senha atual (apenas se não for master alterando senha de outro usuário)
      if (currentUser && currentUser.id === id) {
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            error: 'Senha atual incorreta'
          });
        }
      }

      // Atualizar senha
      await user.update({ password: newPassword });

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter perfil do usuário atual
   * GET /api/users/profile
   */
  static async getProfile(req, res, next) {
    try {
      const currentUser = req.user;
      
      const user = await User.findByPk(currentUser.id, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'email', 'cnpj']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar perfil do usuário atual
   * PUT /api/users/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const currentUser = req.user;
      const { firstName, lastName, phone, preferences } = req.body;

      const user = await User.findByPk(currentUser.id);
      
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;
      if (preferences) updateData.preferences = preferences;

      await user.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;

