const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
      isAfterStart(value) {
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
    type: DataTypes.ENUM('passeio', 'manutencao', 'reuniao', 'treinamento', 'evento_especial', 'outro'),
    defaultValue: 'passeio',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'adiado'),
    defaultValue: 'agendado',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
    defaultValue: 'media',
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#99CD85',
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
        args: [0],
        msg: 'Lembrete deve ser um número positivo'
      }
    }
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  recurrence_rule: {
    type: DataTypes.JSON,
    allowNull: true
  },
  attendees: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trip_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'trips',
      key: 'id'
    }
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'events',
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
      fields: ['start_date', 'status']
    }
  ],
  hooks: {
    beforeValidate: (event) => {
      // Validar cor
      if (event.color && !event.color.startsWith('#')) {
        event.color = '#' + event.color;
      }
      
      // Se for evento de dia inteiro, ajustar horários
      if (event.all_day) {
        if (event.start_date) {
          const startDate = new Date(event.start_date);
          startDate.setHours(0, 0, 0, 0);
          event.start_date = startDate;
        }
        
        if (event.end_date) {
          const endDate = new Date(event.end_date);
          endDate.setHours(23, 59, 59, 999);
          event.end_date = endDate;
        }
      }
    }
  }
});

// Métodos de instância
Event.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

Event.prototype.isUpcoming = function() {
  return new Date(this.start_date) > new Date();
};

Event.prototype.isToday = function() {
  const today = new Date();
  const eventDate = new Date(this.start_date);
  return eventDate.toDateString() === today.toDateString();
};

Event.prototype.getDuration = function() {
  if (!this.end_date) return null;
  return new Date(this.end_date) - new Date(this.start_date);
};

// Métodos estáticos
Event.findByCompany = function(companyId, options = {}) {
  return this.findAll({
    where: { company_id: companyId },
    order: [['start_date', 'ASC']],
    ...options
  });
};

Event.findUpcoming = function(companyId, days = 30) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return this.findAll({
    where: {
      company_id: companyId,
      start_date: {
        [DataTypes.Op.between]: [now, futureDate]
      },
      status: {
        [DataTypes.Op.notIn]: ['cancelado', 'concluido']
      }
    },
    order: [['start_date', 'ASC']]
  });
};

Event.findByDateRange = function(companyId, startDate, endDate) {
  return this.findAll({
    where: {
      company_id: companyId,
      start_date: {
        [DataTypes.Op.between]: [startDate, endDate]
      }
    },
    order: [['start_date', 'ASC']]
  });
};

Event.findToday = function(companyId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return this.findAll({
    where: {
      company_id: companyId,
      start_date: {
        [DataTypes.Op.between]: [startOfDay, endOfDay]
      }
    },
    order: [['start_date', 'ASC']]
  });
};

module.exports = Event;

