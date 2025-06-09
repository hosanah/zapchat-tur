const { Seller, Company, User } = require('../models');
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
          { lastName: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: sellers } = await Seller.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        include: [
          { model: Company, as: 'company', attributes: ['id', 'name'] },
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
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

  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const seller = await Seller.findByPk(id, {
        include: [
          { model: Company, as: 'company', attributes: ['id', 'name'] },
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });

      if (!seller) {
        return res.status(404).json({ success: false, error: 'Vendedor não encontrado' });
      }

      if (!req.user.isMaster() && seller.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }

      res.status(200).json({ success: true, data: { seller } });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }

      if (!req.user.company_id) {
        return res.status(400).json({ success: false, error: 'Usuário sem empresa associada' });
      }

      const sellerData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company_id: req.user.company_id,
        created_by: req.user.id
      };

      const company = await Company.findByPk(sellerData.company_id);
      if (!company) {
        return res.status(400).json({ success: false, error: 'Empresa não encontrada' });
      }

      const seller = await Seller.create(sellerData);

      res.status(201).json({ success: true, message: 'Vendedor criado com sucesso', data: { seller } });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
      }

      const { id } = req.params;
      const seller = await Seller.findByPk(id);
      if (!seller) {
        return res.status(404).json({ success: false, error: 'Vendedor não encontrado' });
      }

      if (!req.user.isMaster() && seller.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }

      const updateData = { firstName: req.body.firstName, lastName: req.body.lastName };

      await seller.update(updateData);

      res.status(200).json({ success: true, message: 'Vendedor atualizado com sucesso', data: { seller } });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const seller = await Seller.findByPk(id);
      if (!seller) {
        return res.status(404).json({ success: false, error: 'Vendedor não encontrado' });
      }

      if (!req.user.isMaster() && seller.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }

      await seller.destroy();

      res.status(200).json({ success: true, message: 'Vendedor excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SellerController;
