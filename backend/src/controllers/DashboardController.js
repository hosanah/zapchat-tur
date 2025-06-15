const { Company, User, Vehicle, Driver, Customer, Trip, Booking } = require('../models');

class DashboardController {
  static async getStats(req, res, next) {
    try {
      const companyFilter = req.user.isMaster() ? {} : { company_id: req.user.company_id };
      const companyCondition = req.user.isMaster() ? {} : { id: req.user.company_id };

      const [companies, users, vehicles, drivers, customers, trips, bookings, revenue] = await Promise.all([
        Company.count(companyCondition),
        User.count({ where: companyFilter }),
        Vehicle.count({ where: companyFilter }),
        Driver.count({ where: companyFilter }),
        Customer.count({ where: companyFilter }),
        Trip.count({ where: companyFilter }),
        Booking.count({
          include: [{ model: Trip, as: 'trip', where: companyFilter, required: true }]
        }),
        Booking.sum('total_amount', {
          where: { status: 'pago' },
          include: [{ model: Trip, as: 'trip', where: companyFilter, required: true }]
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          stats: {
            companies: req.user.isMaster() ? companies : 1,
            users,
            vehicles,
            drivers,
            customers,
            trips,
            bookings,
            revenue: parseFloat(revenue) || 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
