const { Event, Trip, User, Company } = require('../models');
const { Op } = require('sequelize');

class EventController {
  // Listar eventos
  static async index(req, res) {
    try {
      const { user } = req;
      const { 
        page = 1, 
        limit = 50, 
        start_date, 
        end_date, 
        type, 
        status,
        search 
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Construir filtros
      const where = {};
      
      // Filtro por empresa (usuários comuns só veem da própria empresa)
      if (user.role === 'master') {
        // Master pode filtrar por empresa específica ou ver todas
        if (req.query.company_id) {
          where.company_id = req.query.company_id;
        }
      } else {
        // Usuários comuns só veem da própria empresa
        where.company_id = user.company_id;
      }

      // Filtros de data
      if (start_date && end_date) {
        where.start_date = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      } else if (start_date) {
        where.start_date = {
          [Op.gte]: new Date(start_date)
        };
      } else if (end_date) {
        where.start_date = {
          [Op.lte]: new Date(end_date)
        };
      }

      // Filtros adicionais
      if (type) where.type = type;
      if (status) where.status = status;

      // Busca por título ou descrição
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: events } = await Event.findAndCountAll({
        where,
        include: [
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'destination', 'start_date']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ],
        order: [['start_date', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: events,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar evento por ID
  static async show(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const where = { id };
      
      // Usuários comuns só podem ver eventos da própria empresa
      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      const event = await Event.findOne({
        where,
        include: [
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'destination', 'start_date', 'end_date']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Criar evento
  static async store(req, res) {
    try {
      const { user } = req;
      const eventData = {
        ...req.body,
        created_by: user.id,
        company_id: user.role === 'master' ? req.body.company_id : user.company_id
      };

      // Validar se a empresa existe (para usuários master)
      if (user.role === 'master' && req.body.company_id) {
        const company = await Company.findByPk(req.body.company_id);
        if (!company) {
          return res.status(400).json({
            success: false,
            message: 'Empresa não encontrada'
          });
        }
      }

      // Validar se o trip existe e pertence à empresa
      if (eventData.trip_id) {
        const trip = await Trip.findOne({
          where: {
            id: eventData.trip_id,
            company_id: eventData.company_id
          }
        });
        
        if (!trip) {
          return res.status(400).json({
            success: false,
            message: 'Passeio não encontrado ou não pertence à empresa'
          });
        }
      }

      const event = await Event.create(eventData);

      // Buscar o evento criado com relacionamentos
      const createdEvent = await Event.findByPk(event.id, {
        include: [
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'destination']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso',
        data: createdEvent
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar evento
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const where = { id };
      
      // Usuários comuns só podem editar eventos da própria empresa
      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      const event = await Event.findOne({ where });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      // Validar se o trip existe e pertence à empresa (se fornecido)
      if (req.body.trip_id) {
        const trip = await Trip.findOne({
          where: {
            id: req.body.trip_id,
            company_id: event.company_id
          }
        });
        
        if (!trip) {
          return res.status(400).json({
            success: false,
            message: 'Passeio não encontrado ou não pertence à empresa'
          });
        }
      }

      await event.update(req.body);

      // Buscar o evento atualizado com relacionamentos
      const updatedEvent = await Event.findByPk(event.id, {
        include: [
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'destination']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Evento atualizado com sucesso',
        data: updatedEvent
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Excluir evento
  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const where = { id };
      
      // Usuários comuns só podem excluir eventos da própria empresa
      if (user.role !== 'master') {
        where.company_id = user.company_id;
      }

      const event = await Event.findOne({ where });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      await event.destroy();

      res.json({
        success: true,
        message: 'Evento excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar eventos por período (para calendário)
  static async getByDateRange(req, res) {
    try {
      const { user } = req;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros start_date e end_date são obrigatórios'
        });
      }

      const where = {
        start_date: {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        }
      };

      // Filtro por empresa
      if (user.role === 'master') {
        if (req.query.company_id) {
          where.company_id = req.query.company_id;
        }
      } else {
        where.company_id = user.company_id;
      }

      const events = await Event.findAll({
        where,
        include: [
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'destination']
          }
        ],
        order: [['start_date', 'ASC']]
      });

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Erro ao buscar eventos por período:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar eventos de hoje
  static async getTodayEvents(req, res) {
    try {
      const { user } = req;
      
      const company_id = user.role === 'master' ? 
        (req.query.company_id || null) : 
        user.company_id;

      if (!company_id) {
        return res.status(400).json({
          success: false,
          message: 'ID da empresa é obrigatório'
        });
      }

      const events = await Event.getTodayEvents(company_id);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Erro ao buscar eventos de hoje:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar próximos eventos
  static async getUpcomingEvents(req, res) {
    try {
      const { user } = req;
      const { limit = 10 } = req.query;
      
      const company_id = user.role === 'master' ? 
        (req.query.company_id || null) : 
        user.company_id;

      if (!company_id) {
        return res.status(400).json({
          success: false,
          message: 'ID da empresa é obrigatório'
        });
      }

      const events = await Event.getUpcomingEvents(company_id, parseInt(limit));

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = EventController;

