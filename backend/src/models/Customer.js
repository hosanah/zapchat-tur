const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome é obrigatório'
      },
      len: {
        args: [2, 50],
        msg: 'Nome deve ter entre 2 e 50 caracteres'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Sobrenome é obrigatório'
      },
      len: {
        args: [2, 50],
        msg: 'Sobrenome deve ter entre 2 e 50 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Email é obrigatório'
      },
      isEmail: {
        msg: 'Email deve ter formato válido'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Telefone é obrigatório'
      },
      len: {
        args: [10, 20],
        msg: 'Telefone deve ter entre 10 e 20 caracteres'
      }
    }
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    validate: {
      is: {
        args: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        msg: 'CPF deve estar no formato XXX.XXX.XXX-XX'
      }
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Data de nascimento deve ser uma data válida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento deve ser anterior à data atual'
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: {
        args: [2, 2],
        msg: 'Estado deve ter 2 caracteres'
      }
    }
  },
  zipCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      is: {
        args: /^\d{5}-?\d{3}$/,
        msg: 'CEP deve estar no formato XXXXX-XXX'
      }
    }
  },
  emergencyContact: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  emergencyPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'Telefone de emergência deve ter entre 10 e 20 caracteres'
      }
    }
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'bloqueado'),
    defaultValue: 'ativo',
    allowNull: false,
    validate: {
      isIn: {
        args: [['ativo', 'inativo', 'bloqueado']],
        msg: 'Status deve ser ativo, inativo ou bloqueado'
      }
    }
  },
  customerSince: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'Data de cadastro deve ser uma data válida'
      }
    }
  },
  totalTrips: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Total de viagens não pode ser negativo'
      }
    }
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Total gasto não pode ser negativo'
      }
    }
  },
  notes: {
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
  tableName: 'customers',
  indexes: [
    {
      unique: true,
      fields: ['email', 'company_id'],
      name: 'customers_email_company_unique'
    },
    {
      unique: true,
      fields: ['cpf', 'company_id'],
      name: 'customers_cpf_company_unique',
      where: {
        cpf: {
          [Op.ne]: null
        }
      }
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['customer_since']
    },
    {
      fields: ['total_trips']
    }
  ],
  hooks: {
    beforeValidate: (customer) => {
      // Normalizar email
      if (customer.email) {
        customer.email = customer.email.toLowerCase().trim();
      }

      // Normalizar CPF
      if (customer.cpf) {
        customer.cpf = customer.cpf.replace(/\D/g, '');
        if (customer.cpf.length === 11) {
          customer.cpf = customer.cpf.replace(
            /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
            '$1.$2.$3-$4'
          );
        }
      }

      // Normalizar CEP
      if (customer.zipCode) {
        customer.zipCode = customer.zipCode.replace(/\D/g, '');
        if (customer.zipCode.length === 8) {
          customer.zipCode = customer.zipCode.replace(
            /^(\d{5})(\d{3})$/,
            '$1-$2'
          );
        }
      }
    }
  }
});

// Métodos de instância
Customer.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

Customer.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Customer.prototype.isActive = function() {
  return this.status === 'ativo';
};

Customer.prototype.getAge = function() {
  if (!this.birthDate) return null;
  
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

Customer.prototype.updateStats = async function(tripCount = 0, amount = 0) {
  await this.update({
    totalTrips: this.totalTrips + tripCount,
    totalSpent: parseFloat(this.totalSpent) + parseFloat(amount)
  });
};

// Métodos estáticos
Customer.findByEmail = function(email, companyId) {
  const normalizedEmail = email.toLowerCase().trim();
  return this.findOne({
    where: { 
      email: normalizedEmail,
      companyId 
    }
  });
};

Customer.findByCpf = function(cpf, companyId) {
  // Normalizar CPF para busca
  const normalizedCpf = cpf.replace(/\D/g, '');
  let formattedCpf = cpf;
  
  if (normalizedCpf.length === 11) {
    formattedCpf = normalizedCpf.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4'
    );
  }

  return this.findOne({
    where: { 
      cpf: formattedCpf,
      companyId 
    }
  });
};

Customer.findByCompany = function(companyId, options = {}) {
  const where = { companyId };
  
  if (options.status) {
    where.status = options.status;
  }

  return this.findAll({
    where,
    order: [['firstName', 'ASC'], ['lastName', 'ASC']]
  });
};

Customer.findActive = function(companyId) {
  return this.findAll({
    where: { 
      companyId,
      status: 'ativo'
    },
    order: [['firstName', 'ASC'], ['lastName', 'ASC']]
  });
};

Customer.findTopCustomers = function(companyId, limit = 10) {
  return this.findAll({
    where: { companyId },
    order: [['totalSpent', 'DESC'], ['totalTrips', 'DESC']],
    limit
  });
};

Customer.findRecentCustomers = function(companyId, days = 30) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  return this.findAll({
    where: {
      companyId,
      customerSince: {
        [Op.gte]: sinceDate
      }
    },
    order: [['customerSince', 'DESC']]
  });
};

Customer.getStatsByCompany = function(companyId) {
  return this.findAll({
    where: { companyId },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('total_trips')), 'totalTrips'],
      [sequelize.fn('SUM', sequelize.col('total_spent')), 'totalSpent'],
      [sequelize.fn('AVG', sequelize.col('total_spent')), 'avgSpent']
    ],
    group: ['status'],
    raw: true
  });
};

module.exports = Customer;

