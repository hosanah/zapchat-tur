const { Customer, Company, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controlador para operações com clientes
 */
class CustomerController {
  /**
   * Listar todos os clientes
   * GET /api/customers
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status, companyId } = req.query;
      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {};
      
      // Filtro por empresa (usuários não-master só veem da própria empresa)
      if (req.user.isMaster() && companyId) {
        where.companyId = companyId;
      } else if (!req.user.isMaster()) {
        where.companyId = req.user.companyId;
      }

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { cpf: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      const { count, rows: customers } = await Customer.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        include: [
          {
            model: Company,
            as: 'Company',
            attributes: ['id', 'name']
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: {
          customers,
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
   * Obter cliente por ID
   * GET /api/customers/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const customer = await Customer.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'Company',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && customer.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      res.status(200).json({
        success: true,
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo cliente
   * POST /api/customers
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

      const customerData = req.body;

      // Definir empresa (usuários não-master só podem criar para sua empresa)
      if (!req.user.isMaster()) {
        customerData.companyId = req.user.companyId;
      }

      // Verificar se empresa existe
      const company = await Company.findByPk(customerData.companyId);
      if (!company) {
        return res.status(400).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Verificar se email já existe na empresa
      const existingCustomerByEmail = await Customer.findByEmail(customerData.email, customerData.companyId);
      if (existingCustomerByEmail) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um cliente com este email nesta empresa'
        });
      }

      // Verificar se CPF já existe na empresa (se fornecido)
      if (customerData.cpf) {
        const existingCustomerByCpf = await Customer.findByCpf(customerData.cpf, customerData.companyId);
        if (existingCustomerByCpf) {
          return res.status(409).json({
            success: false,
            error: 'Já existe um cliente com este CPF nesta empresa'
          });
        }
      }

      const customer = await Customer.create(customerData);

      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar cliente
   * PUT /api/customers/:id
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

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && customer.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se email já existe (exceto para o cliente atual)
      if (updateData.email && updateData.email !== customer.email) {
        const existingCustomer = await Customer.findByEmail(updateData.email, customer.companyId);
        if (existingCustomer && existingCustomer.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Já existe um cliente com este email nesta empresa'
          });
        }
      }

      // Verificar se CPF já existe (exceto para o cliente atual)
      if (updateData.cpf && updateData.cpf !== customer.cpf) {
        const existingCustomer = await Customer.findByCpf(updateData.cpf, customer.companyId);
        if (existingCustomer && existingCustomer.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Já existe um cliente com este CPF nesta empresa'
          });
        }
      }

      // Não permitir alterar empresa
      delete updateData.companyId;

      await customer.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir cliente
   * DELETE /api/customers/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && customer.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // TODO: Verificar se há reservas associadas antes de excluir

      await customer.destroy();

      res.status(200).json({
        success: true,
        message: 'Cliente excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar status do cliente
   * PATCH /api/customers/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['ativo', 'inativo', 'bloqueado'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status deve ser ativo, inativo ou bloqueado'
        });
      }

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && customer.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      await customer.update({ status });

      res.status(200).json({
        success: true,
        message: `Status do cliente alterado para ${status}`,
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter clientes ativos
   * GET /api/customers/active
   */
  static async getActive(req, res, next) {
    try {
      const { companyId } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const customers = await Customer.findActive(targetCompanyId);

      res.status(200).json({
        success: true,
        data: { customers }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter clientes recentes
   * GET /api/customers/recent
   */
  static async getRecent(req, res, next) {
    try {
      const { companyId, days = 30 } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const customers = await Customer.findRecentCustomers(targetCompanyId, parseInt(days));

      res.status(200).json({
        success: true,
        data: { customers }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter top clientes
   * GET /api/customers/top
   */
  static async getTop(req, res, next) {
    try {
      const { companyId, limit = 10 } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const customers = await Customer.findTopCustomers(targetCompanyId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: { customers }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas dos clientes
   * GET /api/customers/stats
   */
  static async getStats(req, res, next) {
    try {
      const { companyId } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const stats = await Customer.getStatsByCompany(targetCompanyId);

      // Organizar estatísticas
      const organized = {
        total: 0,
        byStatus: {
          ativo: 0,
          inativo: 0,
          bloqueado: 0
        },
        totalTrips: 0,
        totalSpent: 0,
        avgSpent: 0
      };

      stats.forEach(stat => {
        const count = parseInt(stat.count);
        organized.total += count;
        organized.byStatus[stat.status] = count;
        organized.totalTrips += parseInt(stat.totalTrips || 0);
        organized.totalSpent += parseFloat(stat.totalSpent || 0);
        organized.avgSpent += parseFloat(stat.avgSpent || 0);
      });

      // Calcular média geral
      if (organized.total > 0) {
        organized.avgSpent = organized.totalSpent / organized.total;
      }

      res.status(200).json({
        success: true,
        data: { stats: organized }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerController;

