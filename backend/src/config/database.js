const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do banco de dados baseada no ambiente
const config = {
  development: {
    dialect: 'sqlite',
    storage: (process.env.NODE_ENV === 'production' && process.env.DB_STORAGE) || path.join(__dirname, '../database/zapchat_tur_dev.sqlite'),
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  production: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

// Criar instância do Sequelize
const sequelize = new Sequelize(dbConfig);

// Função para testar conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
}

// Função para sincronizar modelos
async function syncModels(options = {}) {
  try {
    await sequelize.sync(options);
    console.log('✅ Modelos sincronizados com sucesso.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
    return false;
  }
}

// Função para fechar conexão
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('✅ Conexão com banco de dados fechada.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncModels,
  closeConnection,
  config
};

