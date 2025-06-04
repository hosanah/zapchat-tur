const { Company, User, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controlador para operações com empresas
 */
class CompanyController {
  /**
   * Listar todas as empresas
   * GET /api/companies
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, active } = req.query;
      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {};
      
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { cnpj: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (active !== undefined) {
        where.isActive = active === 'true';
      }

      const { count, rows: companies } = await Company.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']],
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive'],
            where: { isActive: true },
            required: false
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: {
          companies,
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
   * Obter empresa por ID
   * GET /api/companies/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id, {
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'lastLogin'],
            order: [['firstName', 'ASC']]
          }
        ]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar nova empresa
   * POST /api/companies
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

      const companyData = req.body;

      // Verificar se CNPJ já existe
      const existingCompanyByCnpj = await Company.findByCnpj(companyData.cnpj);
      if (existingCompanyByCnpj) {
        return res.status(409).json({
          success: false,
          error: 'CNPJ já está cadastrado'
        });
      }

      // Verificar se email já existe
      const existingCompanyByEmail = await Company.findByEmail(companyData.email);
      if (existingCompanyByEmail) {
        return res.status(409).json({
          success: false,
          error: 'Email já está cadastrado'
        });
      }

      const company = await Company.create(companyData);

      res.status(201).json({
        success: true,
        message: 'Empresa criada com sucesso',
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar empresa
   * PUT /api/companies/:id
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

      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Verificar se CNPJ já existe (exceto para a empresa atual)
      if (updateData.cnpj && updateData.cnpj !== company.cnpj) {
        const existingCompanyByCnpj = await Company.findByCnpj(updateData.cnpj);
        if (existingCompanyByCnpj && existingCompanyByCnpj.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'CNPJ já está cadastrado'
          });
        }
      }

      // Verificar se email já existe (exceto para a empresa atual)
      if (updateData.email && updateData.email !== company.email) {
        const existingCompanyByEmail = await Company.findByEmail(updateData.email);
        if (existingCompanyByEmail && existingCompanyByEmail.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Email já está cadastrado'
          });
        }
      }

      await company.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Empresa atualizada com sucesso',
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir empresa (soft delete)
   * DELETE /api/companies/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Verificar se há usuários ativos associados
      const activeUsers = await User.count({
        where: {
          company_id: id,
          isActive: true
        }
      });

      if (activeUsers > 0) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível excluir empresa com usuários ativos. Desative os usuários primeiro.'
        });
      }

      // Soft delete - apenas marcar como inativa
      await company.update({ isActive: false });

      res.status(200).json({
        success: true,
        message: 'Empresa desativada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ativar/Desativar empresa
   * PATCH /api/companies/:id/toggle-status
   */
  static async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      const newStatus = !company.isActive;
      await company.update({ isActive: newStatus });

      res.status(200).json({
        success: true,
        message: `Empresa ${newStatus ? 'ativada' : 'desativada'} com sucesso`,
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas da empresa
   * GET /api/companies/:id/stats
   */
  static async getStats(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Contar usuários por role
      const userStats = await User.findAll({
        where: { company_id: id },
        attributes: [
          'role',
          'isActive',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['role', 'isActive'],
        raw: true
      });

      // Organizar estatísticas
      const stats = {
        users: {
          total: 0,
          active: 0,
          inactive: 0,
          byRole: {
            admin: 0,
            user: 0
          }
        }
      };

      userStats.forEach(stat => {
        const count = parseInt(stat.count);
        stats.users.total += count;
        
        if (stat.isActive) {
          stats.users.active += count;
        } else {
          stats.users.inactive += count;
        }

        if (stat.role !== 'master') {
          stats.users.byRole[stat.role] = (stats.users.byRole[stat.role] || 0) + count;
        }
      });

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompanyController;

