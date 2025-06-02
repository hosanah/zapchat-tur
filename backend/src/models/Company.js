const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome da empresa é obrigatório'
      },
      len: {
        args: [2, 100],
        msg: 'Nome deve ter entre 2 e 100 caracteres'
      }
    }
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: {
      msg: 'CNPJ já está cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'CNPJ é obrigatório'
      },
      is: {
        args: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        msg: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Email já está cadastrado'
    },
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
    allowNull: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'Telefone deve ter entre 10 e 20 caracteres'
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
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Website deve ser uma URL válida'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: true
  }
}, {
  tableName: 'companies',
  indexes: [
    {
      unique: true,
      fields: ['cnpj']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['is_active']
    }
  ],
  hooks: {
    beforeValidate: (company) => {
      // Normalizar CNPJ
      if (company.cnpj) {
        company.cnpj = company.cnpj.replace(/\D/g, '');
        if (company.cnpj.length === 14) {
          company.cnpj = company.cnpj.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            '$1.$2.$3/$4-$5'
          );
        }
      }

      // Normalizar email
      if (company.email) {
        company.email = company.email.toLowerCase().trim();
      }

      // Normalizar CEP
      if (company.zipCode) {
        company.zipCode = company.zipCode.replace(/\D/g, '');
        if (company.zipCode.length === 8) {
          company.zipCode = company.zipCode.replace(
            /^(\d{5})(\d{3})$/,
            '$1-$2'
          );
        }
      }
    }
  }
});

// Métodos de instância
Company.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

// Métodos estáticos
Company.findByEmail = function(email) {
  return this.findOne({
    where: { email: email.toLowerCase().trim() }
  });
};

Company.findByCnpj = function(cnpj) {
  // Normalizar CNPJ para busca
  const normalizedCnpj = cnpj.replace(/\D/g, '');
  let formattedCnpj = cnpj;
  
  if (normalizedCnpj.length === 14) {
    formattedCnpj = normalizedCnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }

  return this.findOne({
    where: { cnpj: formattedCnpj }
  });
};

Company.findActive = function() {
  return this.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']]
  });
};

module.exports = Company;

