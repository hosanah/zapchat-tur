const { Trip, Vehicle, Driver, Customer, Company, Booking, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controlador para operações com passeios
 */
class TripController {
  /**
   * Listar todos os passeios
   * GET /api/trips
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status, type, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {};
      
      // Filtro por empresa (usuários não-master só veem da própria empresa)
      if (req.user.isMaster() && req.user.companyId) {
        where.company_id = req.user.companyId;
      } else if (!req.user.isMaster()) {
        where.companyId = req.user.companyId;
      }

      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { origin: { [Op.iLike]: `%${search}%` } },
          { destination: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      if (startDate) {
        where.startDate = {
          [Op.gte]: new Date(startDate)
        };
      }

      if (endDate) {
        where.startDate = {
          ...where.startDate,
          [Op.lte]: new Date(endDate)
        };
      }

      const { count, rows: trips } = await Trip.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['startDate', 'ASC']],
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          },
          {
            model: Vehicle,
            as: 'Vehicle',
            attributes: ['id', 'plate', 'brand', 'model', 'capacity']
          },
          {
            model: Driver,
            as: 'Driver',
            attributes: ['id', 'firstName', 'lastName', 'phone']
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: {
          trips,
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
   * Obter passeio por ID
   * GET /api/trips/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const trip = await Trip.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          },
          {
            model: Vehicle,
            as: 'Vehicle',
            attributes: ['id', 'plate', 'brand', 'model', 'capacity', 'type']
          },
          {
            model: Driver,
            as: 'Driver',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'licenseCategory']
          },
          {
            model: Booking,
            as: 'Bookings',
            include: [
              {
                model: Customer,
                as: 'Customer',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
              }
            ]
          }
        ]
      });

      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Passeio não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && trip.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      res.status(200).json({
        success: true,
        data: { trip }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo passeio
   * POST /api/trips
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

      const tripData = req.body;

      // Definir empresa (usuários não-master só podem criar para sua empresa)
      if (!req.user.isMaster()) {
        tripData.companyId = req.user.companyId;
      }

      // Verificar se empresa existe
      const company = await Company.findByPk(tripData.companyId);
      if (!company) {
        return res.status(400).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Verificar se veículo existe e pertence à empresa (se fornecido)
      if (tripData.vehicleId) {
        const vehicle = await Vehicle.findByPk(tripData.vehicleId);
        if (!vehicle || vehicle.companyId !== tripData.companyId) {
          return res.status(400).json({
            success: false,
            error: 'Veículo não encontrado ou não pertence à empresa'
          });
        }

        // Definir capacidade máxima baseada no veículo
        if (!tripData.maxPassengers) {
          tripData.maxPassengers = vehicle.capacity;
        }
      }

      // Verificar se motorista existe e pertence à empresa (se fornecido)
      if (tripData.driverId) {
        const driver = await Driver.findByPk(tripData.driverId);
        if (!driver || driver.companyId !== tripData.companyId) {
          return res.status(400).json({
            success: false,
            error: 'Motorista não encontrado ou não pertence à empresa'
          });
        }
      }

      const trip = await Trip.create(tripData);

      res.status(201).json({
        success: true,
        message: 'Passeio criado com sucesso',
        data: { trip }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar passeio
   * PUT /api/trips/:id
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

      const trip = await Trip.findByPk(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Passeio não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && trip.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se veículo existe e pertence à empresa (se fornecido)
      if (updateData.vehicleId) {
        const vehicle = await Vehicle.findByPk(updateData.vehicleId);
        if (!vehicle || vehicle.companyId !== trip.companyId) {
          return res.status(400).json({
            success: false,
            error: 'Veículo não encontrado ou não pertence à empresa'
          });
        }
      }

      // Verificar se motorista existe e pertence à empresa (se fornecido)
      if (updateData.driverId) {
        const driver = await Driver.findByPk(updateData.driverId);
        if (!driver || driver.companyId !== trip.companyId) {
          return res.status(400).json({
            success: false,
            error: 'Motorista não encontrado ou não pertence à empresa'
          });
        }
      }

      // Não permitir alterar empresa
      delete updateData.companyId;

      await trip.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Passeio atualizado com sucesso',
        data: { trip }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir passeio
   * DELETE /api/trips/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const trip = await Trip.findByPk(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Passeio não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && trip.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se há reservas confirmadas
      const confirmedBookings = await Booking.count({
        where: {
          tripId: id,
          status: {
            [Op.in]: ['confirmado', 'pago']
          }
        }
      });

      if (confirmedBookings > 0) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível excluir passeio com reservas confirmadas'
        });
      }

      await trip.destroy();

      res.status(200).json({
        success: true,
        message: 'Passeio excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar status do passeio
   * PATCH /api/trips/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status deve ser planejado, confirmado, em_andamento, concluido ou cancelado'
        });
      }

      const trip = await Trip.findByPk(id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Passeio não encontrado'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && trip.companyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      await trip.updateStatus(status);

      res.status(200).json({
        success: true,
        message: `Status do passeio alterado para ${status}`,
        data: { trip }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter passeios ativos
   * GET /api/trips/active
   */
  static async getActive(req, res, next) {
    try {
      const { companyId } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const trips = await Trip.findActive(targetCompanyId);

      res.status(200).json({
        success: true,
        data: { trips }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter passeios próximos
   * GET /api/trips/upcoming
   */
  static async getUpcoming(req, res, next) {
    try {
      const { companyId, days = 30 } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const trips = await Trip.findUpcoming(targetCompanyId, parseInt(days));

      res.status(200).json({
        success: true,
        data: { trips }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter passeios disponíveis
   * GET /api/trips/available
   */
  static async getAvailable(req, res, next) {
    try {
      const { companyId } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const trips = await Trip.findAvailableTrips(targetCompanyId);

      res.status(200).json({
        success: true,
        data: { trips }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas dos passeios
   * GET /api/trips/stats
   */
  static async getStats(req, res, next) {
    try {
      const { companyId } = req.query;

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const stats = await Trip.getStatsByCompany(targetCompanyId);

      // Organizar estatísticas
      const organized = {
        total: 0,
        byStatus: {
          planejado: 0,
          confirmado: 0,
          em_andamento: 0,
          concluido: 0,
          cancelado: 0
        },
        byType: {
          turismo: 0,
          transfer: 0,
          excursao: 0,
          fretamento: 0,
          outros: 0
        },
        totalPassengers: 0,
        totalRevenue: 0,
        avgPrice: 0
      };

      stats.forEach(stat => {
        const count = parseInt(stat.count);
        organized.total += count;
        organized.byStatus[stat.status] = (organized.byStatus[stat.status] || 0) + count;
        organized.byType[stat.type] = (organized.byType[stat.type] || 0) + count;
        organized.totalPassengers += parseInt(stat.totalPassengers || 0);
        organized.totalRevenue += parseFloat(stat.totalRevenue || 0);
        organized.avgPrice += parseFloat(stat.avgPrice || 0);
      });

      // Calcular média geral
      if (organized.total > 0) {
        organized.avgPrice = organized.totalRevenue / organized.totalPassengers || 0;
      }

      res.status(200).json({
        success: true,
        data: { stats: organized }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter receita por período
   * GET /api/trips/revenue
   */
  static async getRevenue(req, res, next) {
    try {
      const { companyId, startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Data de início e fim são obrigatórias'
        });
      }

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.companyId) {
        targetCompanyId = companyId;
      } else {
        targetCompanyId = req.user.companyId;
      }

      const revenue = await Trip.getRevenueByPeriod(targetCompanyId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: { revenue }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TripController;

