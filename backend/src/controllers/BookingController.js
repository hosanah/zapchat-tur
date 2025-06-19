const { Booking, Trip, Customer, Company, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controlador para operações com reservas
 */
class BookingController {
  /**
   * Listar todas as reservas
   * GET /api/bookings
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status, company_id, tripId, customerId } = req.query;
      const offset = (page - 1) * limit;

      // Construir filtros para Trip (empresa)
      const tripWhere = {};
      if (req.user.isMaster() && req.user.company_id) {
        tripWhere.company_id = req.user.company_id;
      } else if (!req.user.isMaster()) {
        tripWhere.company_id = req.user.company_id;
      }

      // Construir filtros para Booking
      const bookingWhere = {};
      
      if (status) {
        bookingWhere.status = status;
      }

      if (tripId) {
        bookingWhere.tripId = tripId;
      }

      if (customerId) {
        bookingWhere.customerId = customerId;
      }

      // Filtro de busca
      const customerWhere = {};
      if (search) {
        customerWhere[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: bookings } = await Booking.findAndCountAll({
        where: bookingWhere,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['bookingDate', 'DESC']],
        include: [
          {
            model: Trip,
            as: 'trip',
            where: tripWhere,
            required: true,
            attributes: ['id', 'title', 'type', 'priceTrips', 'maxPassengers']
          },
          {
            model: Customer,
            as: 'customer',
            where: customerWhere,
            required: true,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: {
          bookings,
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
   * Obter reserva por ID
   * GET /api/bookings/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: Trip,
            as: 'trip',
            include: [
              {
                model: Company,
                as: 'company',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Reserva não encontrada'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && booking.Trip.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      res.status(200).json({
        success: true,
        data: { booking }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar nova reserva
   * POST /api/bookings
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

      const bookingData = req.body;

      // Verificar se o passeio existe
      const trip = await Trip.findByPk(bookingData.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Passeio não encontrado'
        });
      }

      // Verificar permissão de acesso ao passeio
      if (!req.user.isMaster() && trip.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Verificar se o cliente existe
      const customer = await Customer.findByPk(bookingData.customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      // Verificar se cliente pertence à mesma empresa
      if (customer.company_id !== trip.company_id) {
        return res.status(400).json({
          success: false,
          error: 'Cliente não pertence à mesma empresa do passeio'
        });
      }

      // Verificar se há assentos disponíveis
      if (!trip.hasAvailableSeats() || trip.getAvailableSeats() < bookingData.passengers) {
        return res.status(400).json({
          success: false,
          error: 'Não há assentos suficientes disponíveis'
        });
      }

      // Verificar se cliente já tem reserva para este passeio
      const existingBooking = await Booking.findOne({
        where: {
          customerId: bookingData.customerId,
          tripId: bookingData.tripId,
          status: {
            [Op.ne]: 'cancelado'
          }
        }
      });

      if (existingBooking) {
        return res.status(409).json({
          success: false,
          error: 'Cliente já possui reserva para este passeio'
        });
      }

      const booking = await Booking.create(bookingData);

      // Recarregar com relacionamentos
      const createdBooking = await Booking.findByPk(booking.id, {
        include: [
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'type']
          },
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Reserva criada com sucesso',
        data: { booking: createdBooking }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar reserva
   * PUT /api/bookings/:id
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

      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: Trip,
            as: 'trip'
          }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Reserva não encontrada'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && booking.Trip.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      // Não permitir alterar passeio ou cliente
      delete updateData.tripId;
      delete updateData.customerId;

      if (updateData.passengers && updateData.passengers !== booking.passengers) {
        const trip = booking.Trip;
        updateData.totalAmount = parseFloat(trip.priceTrips) * parseInt(updateData.passengers);
      }

      await booking.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Reserva atualizada com sucesso',
        data: { booking }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancelar reserva
   * DELETE /api/bookings/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: Trip,
            as: 'trip'
          }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Reserva não encontrada'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && booking.Trip.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      await booking.cancel();

      res.status(200).json({
        success: true,
        message: 'Reserva cancelada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirmar pagamento
   * PATCH /api/bookings/:id/payment
   */
  static async confirmPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      if (!paymentMethod || !['dinheiro', 'cartao', 'pix', 'transferencia', 'outros'].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          error: 'Método de pagamento deve ser dinheiro, cartao, pix, transferencia ou outros'
        });
      }

      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: Trip,
            as: 'trip'
          }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Reserva não encontrada'
        });
      }

      // Verificar permissão de acesso
      if (!req.user.isMaster() && booking.Trip.company_id !== req.user.company_id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      await booking.markAsPaid(paymentMethod);

      res.status(200).json({
        success: true,
        message: 'Pagamento confirmado com sucesso',
        data: { booking }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter reservas pendentes
   * GET /api/bookings/pending
   */
  static async getPending(req, res, next) {
    try {

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.company_id) {
        targetCompanyId = req.user.company_id;
      } else {
        targetCompanyId = req.user.company_id;
      }

      const bookings = await Booking.findPending(targetCompanyId);

      res.status(200).json({
        success: true,
        data: { bookings }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas de receita
   * GET /api/bookings/revenue
   */
  static async getRevenue(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Data de início e fim são obrigatórias'
        });
      }

      // Determinar empresa
      let targetCompanyId;
      if (req.user.isMaster() && req.user.company_id) {
        targetCompanyId = req.user.company_id;
      } else {
        targetCompanyId = req.user.company_id;
      }

      const revenue = await Booking.getRevenueStats(targetCompanyId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: { revenue }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController;

