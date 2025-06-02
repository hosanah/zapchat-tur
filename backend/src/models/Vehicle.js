const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  plate: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Placa é obrigatória'
      },
      len: {
        args: [7, 10],
        msg: 'Placa deve ter entre 7 e 10 caracteres'
      }
    }
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Marca é obrigatória'
      },
      len: {
        args: [2, 50],
        msg: 'Marca deve ter entre 2 e 50 caracteres'
      }
    }
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Modelo é obrigatório'
      },
      len: {
        args: [2, 50],
        msg: 'Modelo deve ter entre 2 e 50 caracteres'
      }
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Ano é obrigatório'
      },
      min: {
        args: 1900,
        msg: 'Ano deve ser maior que 1900'
      },
      max: {
        args: new Date().getFullYear() + 1,
        msg: 'Ano não pode ser maior que o próximo ano'
      }
    }
  },
  color: {
    type: DataTypes.STRING(30),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Cor é obrigatória'
      },
      len: {
        args: [2, 30],
        msg: 'Cor deve ter entre 2 e 30 caracteres'
      }
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Capacidade é obrigatória'
      },
      min: {
        args: 1,
        msg: 'Capacidade deve ser maior que 0'
      },
      max: {
        args: 100,
        msg: 'Capacidade deve ser menor que 100'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('van', 'micro-onibus', 'onibus', 'carro', 'suv'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Tipo é obrigatório'
      },
      isIn: {
        args: [['van', 'micro-onibus', 'onibus', 'carro', 'suv']],
        msg: 'Tipo deve ser van, micro-onibus, onibus, carro ou suv'
      }
    }
  },
  fuel: {
    type: DataTypes.ENUM('gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Combustível é obrigatório'
      },
      isIn: {
        args: [['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']],
        msg: 'Combustível deve ser gasolina, etanol, diesel, flex, eletrico ou hibrido'
      }
    }
  },
  renavam: {
    type: DataTypes.STRING(11),
    allowNull: true,
    validate: {
      len: {
        args: [11, 11],
        msg: 'RENAVAM deve ter 11 dígitos'
      },
      isNumeric: {
        msg: 'RENAVAM deve conter apenas números'
      }
    }
  },
  chassi: {
    type: DataTypes.STRING(17),
    allowNull: true,
    validate: {
      len: {
        args: [17, 17],
        msg: 'Chassi deve ter 17 caracteres'
      }
    }
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: {
      min: {
        args: 0,
        msg: 'Quilometragem não pode ser negativa'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('ativo', 'manutencao', 'inativo'),
    defaultValue: 'ativo',
    allowNull: false,
    validate: {
      isIn: {
        args: [['ativo', 'manutencao', 'inativo']],
        msg: 'Status deve ser ativo, manutencao ou inativo'
      }
    }
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyId: {
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
  tableName: 'vehicles',
  indexes: [
    {
      unique: true,
      fields: ['plate', 'company_id'],
      name: 'vehicles_plate_company_unique'
    },
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
      fields: ['brand']
    }
  ],
  hooks: {
    beforeValidate: (vehicle) => {
      // Normalizar placa
      if (vehicle.plate) {
        vehicle.plate = vehicle.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      }

      // Normalizar chassi
      if (vehicle.chassi) {
        vehicle.chassi = vehicle.chassi.toUpperCase().replace(/[^A-Z0-9]/g, '');
      }

      // Normalizar RENAVAM
      if (vehicle.renavam) {
        vehicle.renavam = vehicle.renavam.replace(/\D/g, '');
      }
    }
  }
});

// Métodos de instância
Vehicle.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

Vehicle.prototype.getFullName = function() {
  return `${this.brand} ${this.model} ${this.year}`;
};

Vehicle.prototype.isAvailable = function() {
  return this.status === 'ativo';
};

Vehicle.prototype.isInMaintenance = function() {
  return this.status === 'manutencao';
};

// Métodos estáticos
Vehicle.findByPlate = function(plate, companyId) {
  const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return this.findOne({
    where: { 
      plate: normalizedPlate,
      companyId 
    }
  });
};

Vehicle.findByCompany = function(companyId, options = {}) {
  const where = { companyId };
  
  if (options.status) {
    where.status = options.status;
  }
  
  if (options.type) {
    where.type = options.type;
  }

  return this.findAll({
    where,
    order: [['brand', 'ASC'], ['model', 'ASC'], ['year', 'DESC']]
  });
};

Vehicle.findAvailable = function(companyId) {
  return this.findAll({
    where: { 
      companyId,
      status: 'ativo'
    },
    order: [['brand', 'ASC'], ['model', 'ASC']]
  });
};

Vehicle.getStatsByCompany = function(companyId) {
  return this.findAll({
    where: { companyId },
    attributes: [
      'status',
      'type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status', 'type'],
    raw: true
  });
};

module.exports = Vehicle;

