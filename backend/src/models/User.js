const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Senha é obrigatória'
      },
      len: {
        args: [6, 100],
        msg: 'Senha deve ter pelo menos 6 caracteres'
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
  role: {
    type: DataTypes.ENUM('master', 'admin', 'user'),
    defaultValue: 'user',
    allowNull: false,
    validate: {
      isIn: {
        args: [['master', 'admin', 'user']],
        msg: 'Role deve ser master, admin ou user'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['role']
    },
    {
      fields: ['email_verification_token']
    },
    {
      fields: ['password_reset_token']
    }
  ],
  hooks: {
    beforeValidate: (user) => {
      // Normalizar email
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }

      // Validar que usuários não-master tenham company_id
      if (user.role !== 'master' && !user.company_id) {
        throw new Error('Usuários não-master devem estar associados a uma empresa');
      }

      // Validar que usuários master não tenham company_id
      if (user.role === 'master' && user.company_id) {
        user.company_id = null;
      }
    },
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

// Métodos de instância
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.emailVerificationToken;
  delete values.passwordResetToken;
  delete values.passwordResetExpires;
  return values;
};

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.isMaster = function() {
  return this.role === 'master';
};

User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.canAccessCompany = function(company_id) {
  // Usuários master podem acessar qualquer empresa
  if (this.isMaster()) {
    return true;
  }
  
  // Usuários comuns só podem acessar sua própria empresa
  return this.company_id === company_id;
};

User.prototype.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ fields: ['lastLogin'] });
};

// Métodos estáticos
User.findByEmail = function(email) {
  return this.findOne({
    where: { email: email.toLowerCase().trim() },
    include: ['company']
  });
};

User.findByCompany = function(company_id) {
  return this.findAll({
    where: { 
      company_id: company_id,
      isActive: true 
    },
    order: [['firstName', 'ASC'], ['lastName', 'ASC']]
  });
};

User.findMasters = function() {
  return this.findAll({
    where: { 
      role: 'master',
      isActive: true 
    },
    order: [['firstName', 'ASC'], ['lastName', 'ASC']]
  });
};

User.findActive = function() {
  return this.findAll({
    where: { isActive: true },
    include: ['company'],
    order: [['firstName', 'ASC'], ['lastName', 'ASC']]
  });
};

module.exports = User;

