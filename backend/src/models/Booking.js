const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  passengers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: 1,
        msg: 'Número de passageiros deve ser maior que zero'
      }
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Valor total não pode ser negativo'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'pago', 'cancelado'),
    defaultValue: 'pendente',
    allowNull: false,
    validate: {
      isIn: {
        args: [['pendente', 'confirmado', 'pago', 'cancelado']],
        msg: 'Status deve ser pendente, confirmado, pago ou cancelado'
      }
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('dinheiro', 'cartao', 'pix', 'transferencia', 'outros'),
    allowNull: true,
    validate: {
      isIn: {
        args: [['dinheiro', 'cartao', 'pix', 'transferencia', 'outros']],
        msg: 'Método de pagamento deve ser dinheiro, cartao, pix, transferencia ou outros'
      }
    }
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Data de pagamento deve ser uma data válida'
      }
    }
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'Data da reserva deve ser uma data válida'
      }
    }
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Solicitações especiais do cliente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações internas'
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  tripId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'trips',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'bookings',
  indexes: [
    {
      unique: true,
      fields: ['customer_id', 'trip_id'],
      name: 'bookings_customer_trip_unique'
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['trip_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['booking_date']
    },
    {
      fields: ['payment_date']
    }
  ],
  hooks: {
    beforeCreate: async (booking) => {
      // Calcular valor total baseado no número de passageiros
      const trip = await sequelize.models.Trip.findByPk(booking.tripId);
      if (trip) {
        booking.totalAmount = parseFloat(trip.pricePerPerson) * parseInt(booking.passengers);
      }
    },
    
    afterCreate: async (booking) => {
      // Atualizar contador de passageiros no passeio
      const trip = await sequelize.models.Trip.findByPk(booking.tripId);
      if (trip) {
        await trip.addPassenger(booking.passengers);
      }

      // Atualizar estatísticas do cliente
      const customer = await sequelize.models.Customer.findByPk(booking.customerId);
      if (customer && booking.status === 'pago') {
        await customer.updateStats(1, booking.totalAmount);
      }
    },

    afterUpdate: async (booking, options) => {
      const previousValues = booking._previousDataValues;
      
      // Se status mudou para pago, atualizar estatísticas do cliente
      if (previousValues.status !== 'pago' && booking.status === 'pago') {
        const customer = await sequelize.models.Customer.findByPk(booking.customerId);
        if (customer) {
          await customer.updateStats(1, booking.totalAmount);
        }
      }

      // Se status mudou para cancelado, remover passageiros do passeio
      if (previousValues.status !== 'cancelado' && booking.status === 'cancelado') {
        const trip = await sequelize.models.Trip.findByPk(booking.tripId);
        if (trip) {
          await trip.removePassenger(booking.passengers);
        }
      }
    },

    beforeDestroy: async (booking) => {
      // Remover passageiros do passeio
      const trip = await sequelize.models.Trip.findByPk(booking.tripId);
      if (trip && booking.status !== 'cancelado') {
        await trip.removePassenger(booking.passengers);
      }
    }
  }
});

// Métodos de instância
Booking.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

Booking.prototype.isPaid = function() {
  return this.status === 'pago';
};

Booking.prototype.isConfirmed = function() {
  return ['confirmado', 'pago'].includes(this.status);
};

Booking.prototype.isCancelled = function() {
  return this.status === 'cancelado';
};

Booking.prototype.markAsPaid = async function(paymentMethod = null) {
  await this.update({
    status: 'pago',
    paymentMethod,
    paymentDate: new Date()
  });
};

Booking.prototype.cancel = async function() {
  await this.update({
    status: 'cancelado'
  });
};

// Métodos estáticos
Booking.findByCustomer = function(customerId, options = {}) {
  const where = { customerId };
  
  if (options.status) {
    where.status = options.status;
  }

  return this.findAll({
    where,
    order: [['bookingDate', 'DESC']],
    include: options.include || []
  });
};

Booking.findByTrip = function(tripId, options = {}) {
  const where = { tripId };
  
  if (options.status) {
    where.status = options.status;
  }

  return this.findAll({
    where,
    order: [['bookingDate', 'ASC']],
    include: options.include || []
  });
};

Booking.findPending = function(company_id) {
  return this.findAll({
    where: {
      status: 'pendente'
    },
    include: [
      {
        model: sequelize.models.Trip,
        where: { company_id },
        required: true
      },
      {
        model: sequelize.models.Customer,
        required: true
      }
    ],
    order: [['bookingDate', 'ASC']]
  });
};

Booking.findByDateRange = function(company_id, startDate, endDate) {
  return this.findAll({
    where: {
      bookingDate: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: sequelize.models.Trip,
        where: { company_id },
        required: true
      },
      {
        model: sequelize.models.Customer,
        required: true
      }
    ],
    order: [['bookingDate', 'DESC']]
  });
};

Booking.getRevenueStats = function(company_id, startDate, endDate) {
  return this.findAll({
    where: {
      status: 'pago',
      paymentDate: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: sequelize.models.Trip,
        where: { company_id },
        required: true,
        attributes: []
      }
    ],
    attributes: [
      [sequelize.fn('DATE', sequelize.col('payment_date')), 'date'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      [sequelize.fn('COUNT', sequelize.col('Booking.id')), 'bookings'],
      [sequelize.fn('SUM', sequelize.col('passengers')), 'passengers']
    ],
    group: [sequelize.fn('DATE', sequelize.col('payment_date'))],
    order: [[sequelize.fn('DATE', sequelize.col('payment_date')), 'ASC']],
    raw: true
  });
};

module.exports = Booking;

