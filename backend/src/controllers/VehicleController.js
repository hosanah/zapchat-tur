const { Vehicle, Company, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controlador para operações com veículos
 */
class VehicleController {
  /**
   * Listar todos os veículos
   * GET /api/vehicles
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status, type, companyId } = req.query;
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
          { plate: { [Op.iLike]: `%${search}%` } },
          { brand: { [Op.iLike]: `%${search}%` } },
          { model: { [Op.iLike]: `%${search}%` } },
          { color: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      const { count, rows: vehicles } = await Vehicle.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['brand', 'ASC'], ['model', 'ASC'], ['year', 'DESC']],
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
          vehicles,
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
   * Obter veículo por ID
   * GET /api/vehicles/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && vehicle.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      res.status(200).json({
        success: true,
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo veículo
   * POST /api/vehicles
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

      const vehicleData = req.body;

      // Definir empresa (usuários não-master só podem criar para sua empresa)
      if (!req.user.isMaster()) {
        vehicleData.companyId = req.user.companyId;
      }

      // Verificar se empresa existe
      const company = await Company.findByPk(vehicleData.companyId);
      if (!company) {
        return res.status(400).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Verificar se placa já existe na empresa
      const existingVehicle = await Vehicle.findByPlate(vehicleData.plate, vehicleData.companyId);
      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um veículo com esta placa nesta empresa'
        });
      }

      const vehicle = await Vehicle.create(vehicleData);

      res.status(201).json({
        success: true,
        message: 'Veículo criado com sucesso',
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar veículo
   * PUT /api/vehicles/:id
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

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && vehicle.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se placa já existe (exceto para o veículo atual)
      if (updateData.plate && updateData.plate !== vehicle.plate) {
        const existingVehicle = await Vehicle.findByPlate(updateData.plate, vehicle.companyId);
        if (existingVehicle && existingVehicle.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Já existe um veículo com esta placa nesta empresa'
          });
        }
      }

      // Não permitir alterar empresa
      delete updateData.companyId;

      await vehicle.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Veículo atualizado com sucesso',
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir veículo
   * DELETE /api/vehicles/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && vehicle.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // TODO: Verificar se há passeios associados antes de excluir

      await vehicle.destroy();

      res.status(200).json({
        success: true,
        message: 'Veículo excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar status do veículo
   * PATCH /api/vehicles/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['ativo', 'manutencao', 'inativo'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status deve ser ativo, manutencao ou inativo'
        });
      }

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && vehicle.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      await vehicle.update({ status });

      res.status(200).json({
        success: true,
        message: `Status do veículo alterado para ${status}`,
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter veículos disponíveis
   * GET /api/vehicles/available
   */
  static async getAvailable(req, res, next) {
    try {
      const { companyId } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const vehicles = await Vehicle.findAvailable(targetCompanyId);

      res.status(200).json({
        success: true,
        data: { vehicles }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas dos veículos
   * GET /api/vehicles/stats
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

      const stats = await Vehicle.getStatsByCompany(targetCompanyId);

      // Organizar estatísticas
      const organized = {
        total: 0,
        byStatus: {
          ativo: 0,
          manutencao: 0,
          inativo: 0
        },
        byType: {
          van: 0,
          'micro-onibus': 0,
          onibus: 0,
          carro: 0,
          suv: 0
        }
      };

      stats.forEach(stat => {
        const count = parseInt(stat.count);
        organized.total += count;
        organized.byStatus[stat.status] = (organized.byStatus[stat.status] || 0) + count;
        organized.byType[stat.type] = (organized.byType[stat.type] || 0) + count;
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

module.exports = VehicleController;

