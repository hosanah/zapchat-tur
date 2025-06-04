const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Driver = sequelize.define('Driver', {
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
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'CPF é obrigatório'
      },
      is: {
        args: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        msg: 'CPF deve estar no formato XXX.XXX.XXX-XX'
      }
    }
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [5, 20],
        msg: 'RG deve ter entre 5 e 20 caracteres'
      }
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Data de nascimento é obrigatória'
      },
      isDate: {
        msg: 'Data de nascimento deve ser uma data válida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento deve ser anterior à data atual'
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
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email deve ter formato válido'
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
  licenseNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Número da CNH é obrigatório'
      },
      len: {
        args: [5, 20],
        msg: 'Número da CNH deve ter entre 5 e 20 caracteres'
      }
    }
  },
  licenseCategory: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Categoria da CNH é obrigatória'
      },
      isIn: {
        args: [['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE']],
        msg: 'Categoria deve ser A, B, C, D, E, AB, AC, AD ou AE'
      }
    }
  },
  licenseExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Validade da CNH é obrigatória'
      },
      isDate: {
        msg: 'Validade da CNH deve ser uma data válida'
      },
      isAfter: {
        args: new Date().toISOString().split('T')[0],
        msg: 'CNH deve estar válida'
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
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'Data de contratação deve ser uma data válida'
      }
    }
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: 0,
        msg: 'Salário não pode ser negativo'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'ferias', 'licenca'),
    defaultValue: 'ativo',
    allowNull: false,
    validate: {
      isIn: {
        args: [['ativo', 'inativo', 'ferias', 'licenca']],
        msg: 'Status deve ser ativo, inativo, ferias ou licenca'
      }
    }
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'drivers',
  indexes: [
    {
      unique: true,
      fields: ['cpf', 'company_id'],
      name: 'drivers_cpf_company_unique'
    },
    {
      unique: true,
      fields: ['license_number', 'company_id'],
      name: 'drivers_license_company_unique'
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['license_category']
    },
    {
      fields: ['license_expiry']
    }
  ],
  hooks: {
    beforeValidate: (driver) => {
      // Normalizar CPF
      if (driver.cpf) {
        driver.cpf = driver.cpf.replace(/\D/g, '');
        if (driver.cpf.length === 11) {
          driver.cpf = driver.cpf.replace(
            /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
            '$1.$2.$3-$4'
          );
        }
      }

      // Normalizar email
      if (driver.email) {
        driver.email = driver.email.toLowerCase().trim();
      }

      // Normalizar CEP
      if (driver.zipCode) {
        driver.zipCode = driver.zipCode.replace(/\D/g, '');
        if (driver.zipCode.length === 8) {
          driver.zipCode = driver.zipCode.replace(
            /^(\d{5})(\d{3})$/,
            '$1-$2'
          );
        }
      }
    }
  }
});

// Métodos de instância
Driver.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

Driver.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Driver.prototype.isActive = function() {
  return this.status === 'ativo';
};

Driver.prototype.isLicenseValid = function() {
  const today = new Date();
  const expiryDate = new Date(this.licenseExpiry);
  return expiryDate > today;
};

Driver.prototype.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

Driver.prototype.canDriveVehicle = function(vehicleType) {
  const categoryMap = {
    'carro': ['B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'],
    'van': ['D', 'E', 'AD', 'AE'],
    'micro-onibus': ['D', 'E', 'AD', 'AE'],
    'onibus': ['D', 'E', 'AD', 'AE'],
    'suv': ['B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE']
  };

  return categoryMap[vehicleType]?.includes(this.licenseCategory) || false;
};

// Métodos estáticos
Driver.findByCpf = function(cpf, company_id) {
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
      company_id 
    }
  });
};

Driver.findByLicense = function(licenseNumber, company_id) {
  return this.findOne({
    where: { 
      licenseNumber,
      company_id 
    }
  });
};

Driver.findByCompany = function(company_id, options = {}) {
  const where = { company_id };
  
  if (options.status) {
    where.status = options.status;
  }
  
  if (options.category) {
    where.licenseCategory = options.category;
  }

  return this.findAll({
    where,
    order: [['firstName', 'ASC'], ['lastName', 'ASC']]
  });
};

Driver.findActive = function(company_id) {
  return this.findAll({
    where: { 
      company_id,
      status: 'ativo'
    },
    order: [['firstName', 'ASC'], ['lastName', 'ASC']]
  });
};

Driver.findExpiringLicenses = function(company_id, days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.findAll({
    where: {
      company_id,
      licenseExpiry: {
        [sequelize.Op.lte]: futureDate
      },
      status: 'ativo'
    },
    order: [['licenseExpiry', 'ASC']]
  });
};

Driver.getStatsByCompany = function(company_id) {
  return this.findAll({
    where: { company_id },
    attributes: [
      'status',
      'licenseCategory',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status', 'licenseCategory'],
    raw: true
  });
};

module.exports = Driver;

