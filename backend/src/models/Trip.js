const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const Trip = sequelize.define('Trip', {
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
  origin: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Origem é obrigatória'
      },
      len: {
        args: [3, 200],
        msg: 'Origem deve ter entre 3 e 200 caracteres'
      }
    }
  },
  destination: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Destino é obrigatório'
      },
      len: {
        args: [3, 200],
        msg: 'Destino deve ter entre 3 e 200 caracteres'
      }
    }
  },
  waypoints: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false,
    comment: 'Pontos intermediários da rota'
  },
  startDate: {
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
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Data de fim deve ser uma data válida'
      },
      isAfterStart(value) {
        if (value && this.startDate && new Date(value) <= new Date(this.startDate)) {
          throw new Error('Data de fim deve ser posterior à data de início');
        }
      }
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duração em minutos',
    validate: {
      min: {
        args: 1,
        msg: 'Duração deve ser maior que zero'
      }
    }
  },
  distance: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Distância em quilômetros',
    validate: {
      min: {
        args: 0,
        msg: 'Distância não pode ser negativa'
      }
    }
  },
  maxPassengers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'Número máximo de passageiros deve ser maior que zero'
      }
    }
  },
  currentPassengers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Número atual de passageiros não pode ser negativo'
      }
    }
  },
  pricePerPerson: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Preço por pessoa não pode ser negativo'
      }
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Preço total não pode ser negativo'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'),
    defaultValue: 'planejado',
    allowNull: false,
    validate: {
      isIn: {
        args: [['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado']],
        msg: 'Status deve ser planejado, confirmado, em_andamento, concluido ou cancelado'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('turismo', 'transfer', 'excursao', 'fretamento', 'outros'),
    defaultValue: 'turismo',
    allowNull: false,
    validate: {
      isIn: {
        args: [['turismo', 'transfer', 'excursao', 'fretamento', 'outros']],
        msg: 'Tipo deve ser turismo, transfer, excursao, fretamento ou outros'
      }
    }
  },
  meetingPoint: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Ponto de encontro'
  },
  meetingTime: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Horário de encontro'
  },
  requirements: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false,
    comment: 'Requisitos especiais (acessibilidade, etc.)'
  },
  inclusions: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false,
    comment: 'O que está incluído no passeio'
  },
  exclusions: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false,
    comment: 'O que não está incluído no passeio'
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Política de cancelamento'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações gerais'
  },
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'vehicles',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'drivers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'trips',
  indexes: [
    {
      fields: ['company_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['vehicle_id']
    },
    {
      fields: ['driver_id']
    },
    {
      fields: ['start_date', 'status']
    }
  ],
  hooks: {
    beforeValidate: (trip) => {
      // Calcular preço total se não fornecido
      if (!trip.totalPrice && trip.pricePerPerson && trip.currentPassengers) {
        trip.totalPrice = parseFloat(trip.pricePerPerson) * parseInt(trip.currentPassengers);
      }

      // Validar capacidade máxima
      if (trip.currentPassengers > trip.maxPassengers) {
        throw new Error('Número atual de passageiros não pode exceder o máximo');
      }
    }
  }
});

// Métodos de instância
Trip.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

Trip.prototype.isActive = function() {
  return ['planejado', 'confirmado', 'em_andamento'].includes(this.status);
};

Trip.prototype.isCompleted = function() {
  return this.status === 'concluido';
};

Trip.prototype.isCancelled = function() {
  return this.status === 'cancelado';
};

Trip.prototype.hasAvailableSeats = function() {
  return this.currentPassengers < this.maxPassengers;
};

Trip.prototype.getAvailableSeats = function() {
  return this.maxPassengers - this.currentPassengers;
};

Trip.prototype.getOccupancyRate = function() {
  return (this.currentPassengers / this.maxPassengers) * 100;
};

Trip.prototype.addPassenger = async function(count = 1) {
  if (this.currentPassengers + count > this.maxPassengers) {
    throw new Error('Não há assentos suficientes disponíveis');
  }

  await this.update({
    currentPassengers: this.currentPassengers + count,
    totalPrice: parseFloat(this.pricePerPerson) * (this.currentPassengers + count)
  });
};

Trip.prototype.removePassenger = async function(count = 1) {
  const newCount = Math.max(0, this.currentPassengers - count);
  
  await this.update({
    currentPassengers: newCount,
    totalPrice: parseFloat(this.pricePerPerson) * newCount
  });
};

Trip.prototype.updateStatus = async function(newStatus) {
  const validTransitions = {
    'planejado': ['confirmado', 'cancelado'],
    'confirmado': ['em_andamento', 'cancelado'],
    'em_andamento': ['concluido', 'cancelado'],
    'concluido': [],
    'cancelado': ['planejado']
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Não é possível alterar status de ${this.status} para ${newStatus}`);
  }

  await this.update({ status: newStatus });
};

// Métodos estáticos
Trip.findByCompany = function(company_id, options = {}) {
  const where = { company_id };
  
  if (options.status) {
    where.status = options.status;
  }

  if (options.type) {
    where.type = options.type;
  }

  if (options.startDate) {
    where.startDate = {
      [Op.gte]: options.startDate
    };
  }

  if (options.endDate) {
    where.startDate = {
      ...where.startDate,
      [Op.lte]: options.endDate
    };
  }

  return this.findAll({
    where,
    order: [['startDate', 'ASC']],
    include: options.include || []
  });
};

Trip.findActive = function(company_id) {
  return this.findAll({
    where: { 
      company_id,
      status: {
        [Op.in]: ['planejado', 'confirmado', 'em_andamento']
      }
    },
    order: [['startDate', 'ASC']]
  });
};

Trip.findUpcoming = function(company_id, days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.findAll({
    where: {
      company_id,
      startDate: {
        [Op.between]: [today, futureDate]
      },
      status: {
        [Op.in]: ['planejado', 'confirmado']
      }
    },
    order: [['startDate', 'ASC']]
  });
};

Trip.findByVehicle = function(vehicleId, options = {}) {
  const where = { vehicleId };
  
  if (options.status) {
    where.status = options.status;
  }

  return this.findAll({
    where,
    order: [['startDate', 'ASC']]
  });
};

Trip.findByDriver = function(driverId, options = {}) {
  const where = { driverId };
  
  if (options.status) {
    where.status = options.status;
  }

  return this.findAll({
    where,
    order: [['startDate', 'ASC']]
  });
};

Trip.findAvailableTrips = function(company_id) {
  return this.findAll({
    where: {
      company_id,
      status: {
        [Op.in]: ['planejado', 'confirmado']
      },
      currentPassengers: {
        [Op.lt]: sequelize.col('max_passengers')
      }
    },
    order: [['startDate', 'ASC']]
  });
};

Trip.getStatsByCompany = function(company_id) {
  return this.findAll({
    where: { company_id },
    attributes: [
      'status',
      'type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('current_passengers')), 'totalPassengers'],
      [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
      [sequelize.fn('AVG', sequelize.col('price_per_person')), 'avgPrice']
    ],
    group: ['status', 'type'],
    raw: true
  });
};

Trip.getRevenueByPeriod = function(company_id, startDate, endDate) {
  return this.findAll({
    where: {
      company_id,
      startDate: {
        [Op.between]: [startDate, endDate]
      },
      status: 'concluido'
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('start_date')), 'date'],
      [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'trips']
    ],
    group: [sequelize.fn('DATE', sequelize.col('start_date'))],
    order: [[sequelize.fn('DATE', sequelize.col('start_date')), 'ASC']],
    raw: true
  });
};

module.exports = Trip;

