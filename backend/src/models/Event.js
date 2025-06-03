const { DataTypes } = require('sequelize');
const { Op } = require('sequelize');

const Event = (sequelize) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Título é obrigatório'
        },
        len: {
          args: [3, 100],
          msg: 'Título deve ter entre 3 e 100 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Data de início é obrigatória'
        },
        isDate: {
          msg: 'Data de início deve ser uma data válida'
        }
      }
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Data de fim deve ser uma data válida'
        },
        isAfterStartDate(value) {
          if (value && this.start_date && value <= this.start_date) {
            throw new Error('Data de fim deve ser posterior à data de início');
          }
        }
      }
    },
    all_day: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('passeio', 'manutencao', 'reuniao', 'treinamento', 'outros'),
      defaultValue: 'passeio',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'),
      defaultValue: 'agendado',
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
      defaultValue: 'media',
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(7), // Para cores hex como #FF5733
      defaultValue: '#99CD85', // Cor padrão do ZapChat
      allowNull: false,
      validate: {
        is: {
          args: /^#[0-9A-F]{6}$/i,
          msg: 'Cor deve estar no formato hexadecimal (#RRGGBB)'
        }
      }
    },
    reminder_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Lembrete deve ser um número positivo'
        }
      }
    },
    attendees: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
      comment: 'Lista de participantes do evento'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Relacionamentos
    trip_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'trips',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['company_id']
      },
      {
        fields: ['trip_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['start_date']
      },
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['start_date', 'end_date']
      },
      {
        fields: ['company_id', 'start_date']
      }
    ]
  });

  // Métodos de instância
  Event.prototype.isUpcoming = function() {
    return this.start_date > new Date();
  };

  Event.prototype.isToday = function() {
    const today = new Date();
    const eventDate = new Date(this.start_date);
    return eventDate.toDateString() === today.toDateString();
  };

  Event.prototype.getDuration = function() {
    if (!this.end_date) return null;
    return Math.round((new Date(this.end_date) - new Date(this.start_date)) / (1000 * 60)); // em minutos
  };

  // Métodos estáticos
  Event.getEventsByDateRange = async function(companyId, startDate, endDate) {
    return await this.findAll({
      where: {
        company_id: companyId,
        start_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: sequelize.models.Trip,
          as: 'trip',
          attributes: ['id', 'title', 'destination']
        },
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['start_date', 'ASC']]
    });
  };

  Event.getUpcomingEvents = async function(companyId, limit = 10) {
    return await this.findAll({
      where: {
        company_id: companyId,
        start_date: {
          [Op.gte]: new Date()
        },
        status: {
          [Op.in]: ['agendado', 'confirmado']
        }
      },
      include: [
        {
          model: sequelize.models.Trip,
          as: 'trip',
          attributes: ['id', 'title', 'destination']
        }
      ],
      order: [['start_date', 'ASC']],
      limit
    });
  };

  Event.getTodayEvents = async function(companyId) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await this.findAll({
      where: {
        company_id: companyId,
        start_date: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [
        {
          model: sequelize.models.Trip,
          as: 'trip',
          attributes: ['id', 'title', 'destination']
        }
      ],
      order: [['start_date', 'ASC']]
    });
  };

  return Event;
};

module.exports = Event;

