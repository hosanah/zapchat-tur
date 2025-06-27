const { Sale, SalePayment, Trip, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class ReportController {
  static buildCompanyFilter(user) {
    if (user.isMaster() && user.company_id) {
      return { company_id: user.company_id };
    }
    if (!user.isMaster()) {
      return { company_id: user.company_id };
    }
    return {};
  }

  static async salesReport(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const where = ReportController.buildCompanyFilter(req.user);
      if (start_date && end_date) {
        where.sale_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
      }
      const sales = await Sale.findAll({
        where,
        include: [
          { model: Trip, as: 'trip', attributes: ['id', 'title'] },
          { model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [['sale_date', 'ASC']]
      });
      res.json({ success: true, data: { sales } });
    } catch (error) {
      next(error);
    }
  }

  static async dailyTrips(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const where = ReportController.buildCompanyFilter(req.user);
      if (start_date && end_date) {
        where.sale_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
      }
      const dailyTrips = await Sale.findAll({
        where,
        attributes: [
          'trip_id',
          [sequelize.fn('DATE', sequelize.col('sale_date')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'sales'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        include: [{ model: Trip, as: 'trip', attributes: ['id', 'title'] }],
        group: ['trip_id', 'trip.id', sequelize.fn('DATE', sequelize.col('sale_date'))],
        order: [[sequelize.fn('DATE', sequelize.col('sale_date')), 'ASC']]
      });
      res.json({ success: true, data: { dailyTrips } });
    } catch (error) {
      next(error);
    }
  }

  static async sellerProductivity(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const where = ReportController.buildCompanyFilter(req.user);
      if (start_date && end_date) {
        where.sale_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
      }
      const productivity = await Sale.findAll({
        where,
        attributes: [
          'seller_id',
          [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'sales'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'email'] }],
        group: ['seller_id', 'seller.id'],
        order: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']]
      });
      res.json({ success: true, data: { productivity } });
    } catch (error) {
      next(error);
    }
  }

  static async financialByPaymentMethod(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const saleWhere = ReportController.buildCompanyFilter(req.user);
      if (start_date && end_date) {
        saleWhere.sale_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
      }
      const financial = await SalePayment.findAll({
        include: [{ model: Sale, as: 'sale', where: saleWhere, attributes: [] }],
        attributes: [
          'payment_method',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
          [sequelize.fn('COUNT', sequelize.col('SalePayment.id')), 'payments']
        ],
        group: ['payment_method'],
        order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
      });
      res.json({ success: true, data: { financial } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
