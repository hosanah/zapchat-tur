const { Vehicle, Booking, Customer, Trip } = require('../models');
const { Op } = require('sequelize');

class ActivityController {
  static async getRecent(req, res, next) {
    try {
      const { limit = 10, days = 7 } = req.query;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - parseInt(days));

      let targetCompanyId;
      if (req.user.isMaster() && req.user.company_id) {
        targetCompanyId = req.user.company_id;
      } else {
        targetCompanyId = req.user.company_id;
      }

      const vehicles = await Vehicle.findAll({
        where: {
          company_id: targetCompanyId,
          createdAt: { [Op.gte]: sinceDate }
        },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      const bookings = await Booking.findAll({
        where: {
          createdAt: { [Op.gte]: sinceDate }
        },
        include: [
          {
            model: Trip,
            as: 'Trip',
            where: { company_id: targetCompanyId },
            attributes: ['title'],
            required: true
          },
          {
            model: Customer,
            as: 'Customer',
            attributes: ['firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      const customers = await Customer.findAll({
        where: {
          company_id: targetCompanyId,
          createdAt: { [Op.gte]: sinceDate }
        },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      let activities = [];

      vehicles.forEach(v => {
        activities.push({
          id: v.id,
          type: 'vehicle',
          message: `Novo veículo cadastrado: ${v.getFullName()}`,
          createdAt: v.createdAt
        });
      });

      bookings.forEach(b => {
        const customerName = b.Customer ? `${b.Customer.firstName} ${b.Customer.lastName}` : '';
        activities.push({
          id: b.id,
          type: 'booking',
          message: `Nova reserva para ${b.Trip.title} - ${customerName}`,
          createdAt: b.createdAt
        });
      });

      customers.forEach(c => {
        activities.push({
          id: c.id,
          type: 'customer',
          message: `Novo cliente cadastrado: ${c.firstName} ${c.lastName}`,
          createdAt: c.createdAt
        });
      });

      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      activities = activities.slice(0, parseInt(limit));

      res.status(200).json({
        success: true,
        data: { activities }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ActivityController;
