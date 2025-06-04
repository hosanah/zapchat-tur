const { Driver, Company, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controlador para operações com motoristas
 */
class DriverController {
  /**
   * Listar todos os motoristas
   * GET /api/drivers
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status, category } = req.query;
      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {};
      
      // Filtro por empresa (usuários não-master só veem da própria empresa)
      if (req.user.isMaster() && req.user.company_id) {
        where.company_id = req.user.company_id;
      } else if (!req.user.isMaster()) {
        where.company_id = req.user.company_id;
      }

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { cpf: { [Op.iLike]: `%${search}%` } },
          { licenseNumber: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (category) {
        where.licenseCategory = category;
      }

      const { count, rows: drivers } = await Driver.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: {
          drivers,
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
   * Obter motorista por ID
   * GET /api/drivers/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const driver = await Driver.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && driver.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      res.status(200).json({
        success: true,
        data: { driver }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo motorista
   * POST /api/drivers
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

      const driverData = req.body;

      // Definir empresa (usuários não-master só podem criar para sua empresa)
      if (!req.user.isMaster()) {
        driverData.company_id = req.user.company_id;
      }

      // Verificar se empresa existe
      const company = await Company.findByPk(driverData.company_id);
      if (!company) {
        return res.status(400).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Verificar se CPF já existe na empresa
      const existingDriverByCpf = await Driver.findByCpf(driverData.cpf, driverData.company_id);
      if (existingDriverByCpf) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um motorista com este CPF nesta empresa'
        });
      }

      // Verificar se CNH já existe na empresa
      const existingDriverByLicense = await Driver.findByLicense(driverData.licenseNumber, driverData.company_id);
      if (existingDriverByLicense) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um motorista com este número de CNH nesta empresa'
        });
      }

      const driver = await Driver.create(driverData);

      res.status(201).json({
        success: true,
        message: 'Motorista criado com sucesso',
        data: { driver }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar motorista
   * PUT /api/drivers/:id
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

      const driver = await Driver.findByPk(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && driver.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se CPF já existe (exceto para o motorista atual)
      if (updateData.cpf && updateData.cpf !== driver.cpf) {
        const existingDriver = await Driver.findByCpf(updateData.cpf, driver.company_id);
        if (existingDriver && existingDriver.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Já existe um motorista com este CPF nesta empresa'
          });
        }
      }

      // Verificar se CNH já existe (exceto para o motorista atual)
      if (updateData.licenseNumber && updateData.licenseNumber !== driver.licenseNumber) {
        const existingDriver = await Driver.findByLicense(updateData.licenseNumber, driver.company_id);
        if (existingDriver && existingDriver.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Já existe um motorista com este número de CNH nesta empresa'
          });
        }
      }

      // Não permitir alterar empresa
      delete updateData.company_id;

      await driver.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Motorista atualizado com sucesso',
        data: { driver }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir motorista
   * DELETE /api/drivers/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const driver = await Driver.findByPk(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && driver.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // TODO: Verificar se há passeios associados antes de excluir

      await driver.destroy();

      res.status(200).json({
        success: true,
        message: 'Motorista excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar status do motorista
   * PATCH /api/drivers/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['ativo', 'inativo', 'ferias', 'licenca'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status deve ser ativo, inativo, ferias ou licenca'
        });
      }

      const driver = await Driver.findByPk(id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && driver.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      await driver.update({ status });

      res.status(200).json({
        success: true,
        message: `Status do motorista alterado para ${status}`,
        data: { driver }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter motoristas ativos
   * GET /api/drivers/active
   */
  static async getActive(req, res, next) {
    try {
      
      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.company_id) {
        targetCompanyId = req.user.company_id;
      } else {
        targetCompanyId = req.user.company_id;
      }

      const drivers = await Driver.findActive(targetCompanyId);

      res.status(200).json({
        success: true,
        data: { drivers }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter motoristas com CNH vencendo
   * GET /api/drivers/expiring-licenses
   */
  static async getExpiringLicenses(req, res, next) {
    try {
      const {  days = 30 } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.company_id) {
        targetCompanyId = req.user.company_id;
      } else {
        targetCompanyId = req.user.company_id;
      }

      const drivers = await Driver.findExpiringLicenses(targetCompanyId, parseInt(days));

      res.status(200).json({
        success: true,
        data: { drivers }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas dos motoristas
   * GET /api/drivers/stats
   */
  static async getStats(req, res, next) {
    try {
            // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.company_id) {
        targetCompanyId = req.user.company_id;
      } else {
        targetCompanyId = req.user.company_id;
      }

      const stats = await Driver.getStatsByCompany(targetCompanyId);

      // Organizar estatísticas
      const organized = {
        total: 0,
        byStatus: {
          ativo: 0,
          inativo: 0,
          ferias: 0,
          licenca: 0
        },
        byCategory: {
          A: 0, B: 0, C: 0, D: 0, E: 0,
          AB: 0, AC: 0, AD: 0, AE: 0
        }
      };

      stats.forEach(stat => {
        const count = parseInt(stat.count);
        organized.total += count;
        organized.byStatus[stat.status] = (organized.byStatus[stat.status] || 0) + count;
        organized.byCategory[stat.licenseCategory] = (organized.byCategory[stat.licenseCategory] || 0) + count;
      });

      res.status(200).json({
        success: true,
        data: { stats: organized }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DriverController;

