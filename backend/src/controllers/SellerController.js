const { Seller, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class SellerController {
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (req.user.isMaster() && req.user.company_id) {
        where.company_id = req.user.company_id;
      } else if (!req.user.isMaster()) {
        where.company_id = req.user.company_id;
      }

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: sellers } = await Seller.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        include: [{
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: {
          sellers,
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

  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const sellerData = req.body;

      if (!req.user.isMaster()) {
        sellerData.company_id = req.user.company_id;
      }

      const company = await Company.findByPk(sellerData.company_id);
      if (!company) {
        return res.status(400).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      const seller = await Seller.create(sellerData);

      res.status(201).json({
        success: true,
        message: 'Vendedor criado com sucesso',
        data: { seller }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SellerController;
