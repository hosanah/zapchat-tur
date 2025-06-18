const { Sale, Customer, Company, User, Trip, Vehicle, Booking, Driver, SaleCustomer } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

class SaleController {
  // Listar vendas com filtros e paginação
  static async index(req, res) {
    try {
      
      const {
        page = 1,
        limit = 10,
        status,
        payment_status,
        customer_id,
        trip_id,
        start_date,
        end_date,
        search,
        sort_by = 'sale_date',
        sort_order = 'DESC'
      } = req.query;

      const user = req.user;
      const offset = (page - 1) * limit;
      const where = {};

      // Construir filtros
      
      // Filtro por empresa (usuários comuns só veem da própria empresa)
      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      // Filtros específicos
      if (status) where.status = status;
      if (payment_status) where.payment_status = payment_status;
      if (customer_id) where.customer_id = customer_id;
      if (trip_id) where.trip_id = trip_id;

      // Filtro por período
      if (start_date && end_date) {
        where.sale_date = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      // Busca textual
      if (search) {
        where[Op.or] = [
          { sale_number: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { notes: { [Op.like]: `%${search}%` } },
          { '$customer.first_name$': { [Op.like]: `%${search}%` } },
          { '$customer.last_name$': { [Op.like]: `%${search}%` } },
          { '$customer.email$': { [Op.like]: `%${search}%` } }
        ];
      }

      // Buscar vendas
      const { count, rows: sales } = await Sale.findAndCountAll({
        where,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'type', 'maxPassengers']
          },
          {
            model: Driver,
            as: 'driver',
            attributes: ['id', 'first_name', 'last_name', 'license_number'],
            required: false
          },
          {
            model: Vehicle,
            as: 'vehicle',
            attributes: ['id', 'plate', 'model', 'brand', 'capacity'],
            required: false
          },
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'first_name', 'email']
          },
          {
            model: SaleCustomer,
            as: 'sale_customers',
            include: [
              {
                model: Customer,
                as: 'customer',
                attributes: ['id', 'first_name', 'last_name', 'email']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true
      });

      // Calcular estatísticas
      const stats = await SaleController.getSalesStats(user);

      res.json({
        success: true,
        data: {
          sales,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit)
          },
          //stats
        }
      });
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar venda específica
  static async show(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const where = { id };

      // Usuários comuns só veem vendas da própria empresa
      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      const sale = await Sale.findOne({
        where,
        include: [
          {
            model: Customer,
            as: 'customer',
            include: [
              {
                model: Company,
                as: 'company',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title']
          },
          {
            model: Company,
            as: 'company'
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'first_name', 'email']
          }
          ,{
            model: User,
            as: 'seller',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ]
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada'
        });
      }

      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Criar nova venda
  static async store(req, res) {
    try {
      const user = req.user;
      const saleData = {
        ...req.body,
        company_id: user.company_id,
        created_by: user.id
      };

      // Validar se o vendedor informado é válido
      if (saleData.seller_id) {
        const seller = await User.findOne({ where: { id: saleData.seller_id } });
        if (
          !seller ||
          (user.role !== 'master' && seller.company_id !== user.company_id)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Vendedor não encontrado ou não pertence à sua empresa'
          });
        }
      }

      let customer;
      if (saleData.customer_id) {
        customer = await Customer.findOne({
          where: {
            id: saleData.customer_id,
            company_id: user.company_id
          }
        });

        if (!customer) {
          return res.status(400).json({
            success: false,
            message: 'Cliente não encontrado ou não pertence à sua empresa'
          });
        }
      } else if (req.body.new_customer) {
        const newCustomerData = {
          ...req.body.new_customer,
          company_id: user.company_id
        };
        customer = await Customer.create(newCustomerData);
        saleData.customer_id = customer.id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Cliente não informado'
        });
      }


      const trip = await Trip.findOne({
        where: {
          id: saleData.trip_id,
          company_id: user.company_id
        }
      });

      if (!trip) {
        return res.status(400).json({
          success: false,
          message: 'Passeio não encontrado ou não pertence à sua empresa'
        });
      }

      if (!saleData.vehicle_id || !saleData.driver_id) {
        return res.status(400).json({
          success: false,
          message: 'Passeio deve possuir veículo e motorista vinculados'
        });
      }

      const confirmedBookings = await Booking.sum('passengers', {
        where: { tripId: trip.id, status: { [Op.ne]: 'cancelado' } }
      });

      const saleCount = await Sale.count({ where: { trip_id: trip.id } });
      const capacity = trip.vehicle ? trip.vehicle.capacity : trip.maxPassengers;

      if ((saleCount + (confirmedBookings || 0)) >= capacity) {
        return res.status(400).json({
          success: false,
          message: 'Limite de passageiros atingido para este passeio'
        });
      }

      const sale = await Sale.create(saleData);

      // Buscar venda criada com relacionamentos
      const createdSale = await Sale.findByPk(sale.id, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'first_name', 'email']
          }
          ,{
            model: User,
            as: 'seller',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Venda criada com sucesso',
        data: createdSale
      });
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar venda
  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const where = { id };

      // Usuários comuns só podem editar vendas da própria empresa
      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      const sale = await Sale.findOne({ where });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada'
        });
      }

      // Validar cliente se foi alterado
      if (req.body.customer_id && req.body.customer_id !== sale.customer_id) {
        const customer = await Customer.findOne({
          where: {
            id: req.body.customer_id,
            company_id: user.company_id
          }
        });

        if (!customer) {
          return res.status(400).json({
            success: false,
            message: 'Cliente não encontrado ou não pertence à sua empresa'
          });
        }
      }


      if (req.body.trip_id && req.body.trip_id !== sale.trip_id) {
        const trip = await Trip.findOne({
          where: { id: req.body.trip_id, company_id: user.company_id },
          include: [{ model: Vehicle, as: 'vehicle' }]
        });

        if (!trip) {
          return res.status(400).json({
            success: false,
            message: 'Passeio não encontrado ou não pertence à sua empresa'
          });
        }

        if (!trip.vehicleId || !trip.driverId) {
          return res.status(400).json({
            success: false,
            message: 'Passeio deve possuir veículo e motorista vinculados'
          });
        }

        const confirmedBookings = await Booking.sum('passengers', {
          where: { tripId: trip.id, status: { [Op.ne]: 'cancelado' } }
        });

        const saleCount = await Sale.count({ where: { trip_id: trip.id } });
        const capacity = trip.vehicle ? trip.vehicle.capacity : trip.maxPassengers;

        if ((saleCount + (confirmedBookings || 0)) >= capacity) {
          return res.status(400).json({
            success: false,
            message: 'Limite de passageiros atingido para este passeio'
          });
        }
      }

      if (req.body.seller_id && req.body.seller_id !== sale.seller_id) {
        const seller = await User.findOne({ where: { id: req.body.seller_id } });
        if (
          !seller ||
          (user.role !== 'master' && seller.company_id !== user.company_id)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Vendedor não encontrado ou não pertence à sua empresa'
          });
        }
      }

      await sale.update(req.body);

      // Buscar venda atualizada com relacionamentos
      const updatedSale = await Sale.findByPk(sale.id, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'first_name', 'email']
          }
          ,{
            model: User,
            as: 'seller',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: 'Venda atualizada com sucesso',
        data: updatedSale
      });
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Excluir venda (soft delete)
  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const where = { id };

      // Usuários comuns só podem excluir vendas da própria empresa
      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      const sale = await Sale.findOne({ where });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada'
        });
      }

      // Soft delete
      await sale.destroy();

      res.json({
        success: true,
        message: 'Venda excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Obter estatísticas de vendas
  static async getSalesStats(user) {
    try {

      const where = {};

      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      // Estatísticas gerais
      const totalSales = await Sale.count({ where });
      
      const totalAmount = await Sale.sum('total_amount', { where });
      
      const totalCommission = await Sale.sum('commission_amount', { where });

      // Vendas por status
      const salesByStatus = await Sale.findAll({
        where,
        attributes: [
          'status',
          [Sale.sequelize.fn('COUNT', Sale.sequelize.col('id')), 'count'],
          [Sale.sequelize.fn('SUM', Sale.sequelize.col('total_amount')), 'total_amount']
        ],
        group: ['status'],
        raw: true
      });

      // Vendas por método de pagamento
      const salesByPaymentMethod = await Sale.findAll({
        where: { ...where, payment_method: { [Op.not]: null } },
        attributes: [
          'payment_method',
          [Sale.sequelize.fn('COUNT', Sale.sequelize.col('id')), 'count'],
          [Sale.sequelize.fn('SUM', Sale.sequelize.col('total_amount')), 'total_amount']
        ],
        group: ['payment_method'],
        raw: true
      });

      // Vendas dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSales = await Sale.count({
        where: {
          ...where,
          sale_date: { [Op.gte]: thirtyDaysAgo }
        }
      });

      const recentAmount = await Sale.sum('total_amount', {
        where: {
          ...where,
          sale_date: { [Op.gte]: thirtyDaysAgo }
        }
      });

      return {
        total_sales: totalSales || 0,
        total_amount: totalAmount || 0,
        total_commission: totalCommission || 0,
        recent_sales: recentSales || 0,
        recent_amount: recentAmount || 0,
        by_status: salesByStatus,
        by_payment_method: salesByPaymentMethod
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total_sales: 0,
        total_amount: 0,
        total_commission: 0,
        recent_sales: 0,
        recent_amount: 0,
        by_status: [],
        by_payment_method: []
      };
    }
  }

  // Endpoint para estatísticas
  static async stats(req, res) {
    try {
      const user = req.user;
      const stats = await SaleController.getSalesStats(user);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar vendas por cliente
  static async byCustomer(req, res) {
    try {
      const { customer_id } = req.params;
      const user = req.user;

      // Verificar se o cliente pertence à empresa do usuário
      const customer = await Customer.findOne({
        where: {
          id: customer_id,
          company_id: user.company_id
        }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      const sales = await Sale.findAll({
        include: [
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title']
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'first_name', 'email']
          }
        ],
        order: [['sale_date', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          customer,
          sales
        }
      });
    } catch (error) {
      console.error('Erro ao buscar vendas do cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Listar clientes vinculados a uma venda
  static async listCustomers(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sale = await Sale.findByPk(id);
      if (!sale || (user.role !== 'master' && sale.company_id !== user.company_id)) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada'
        });
      }

      const saleCustomers = await SaleCustomer.findAll({
        where: { sale_id: id },
        include: [{ model: Customer, as: 'customer', attributes: ['id','first_name','last_name','email','phone','birthDate'] }]
      });

      res.json({ success: true, data: saleCustomers });
    } catch (error) {
      console.error('Erro ao listar clientes da venda:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Adicionar cliente a uma venda
  static async addCustomer(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { firstName, lastName, email, phone, birthDate } = req.body;

      const sale = await Sale.findByPk(id);
      if (!sale || (user.role !== 'master' && sale.company_id !== user.company_id)) {
        return res.status(404).json({
          success: false,
          message: 'Venda não encontrada'
        });
      }

      const customer = await Customer.create({
        firstName,
        lastName,
        email,
        phone,
        birthDate,
        company_id: sale.company_id
      });

      await SaleCustomer.create({ sale_id: id, customer_id: customer.id });

      const saleCustomers = await SaleCustomer.findAll({
        where: { sale_id: id },
        include: [{ model: Customer, as: 'customer', attributes: ['id','first_name','last_name','email','phone','birthDate'] }]
      });

      res.status(201).json({
        success: true,
        message: 'Cliente adicionado com sucesso',
        data: { customer, sale_customers: saleCustomers }
      });
    } catch (error) {
      console.error('Erro ao adicionar cliente na venda:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Gerar voucher em PDF
  static async voucher(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sale = await Sale.findByPk(id, {
        include: [
          { model: Customer, as: 'customer', attributes: ['firstName', 'lastName'] },
          { model: Company, as: 'company', attributes: ['name'] },
          { model: Trip, as: 'trip', attributes: ['title'] },
          {
            model: SaleCustomer,
            as: 'sale_customers',
            include: [
              { model: Customer, as: 'customer', attributes: ['firstName', 'lastName'] }
            ]
          }
        ]
      });

      if (!sale || (user.role !== 'master' && sale.company_id !== user.company_id)) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada' });
      }

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="voucher-${sale.sale_number}.pdf"`);
      doc.pipe(res);

      doc.fontSize(18).text(`Voucher ${sale.sale_number}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      if (sale.company) doc.text(`Empresa: ${sale.company.name}`);
      if (sale.customer) doc.text(`Cliente: ${sale.customer.firstName} ${sale.customer.lastName}`);
      if (sale.trip) doc.text(`Passeio: ${sale.trip.title}`);
      if (sale.sale_date) doc.text(`Data: ${new Date(sale.sale_date).toLocaleDateString('pt-BR')}`);
      doc.moveDown();
      doc.fontSize(14).text('Clientes da venda:');
      sale.sale_customers.forEach((sc, index) => {
        doc.fontSize(12).text(`${index + 1}. ${sc.customer.firstName} ${sc.customer.lastName}`);
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao gerar voucher:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

}

module.exports = SaleController;

