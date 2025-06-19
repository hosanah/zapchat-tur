const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');
//const { runMigrations } = require('../database/migrate');
dotenv.config();


let seedDatabase;
try {
  // Importação condicional do seeder (evita erro caso o arquivo não exista)
  seedDatabase = require('../database/seeders').seedDatabase;
} catch (err) {
  seedDatabase = async () => {
    console.log('ℹ️ Seeder não encontrado ou não definido.');
  };
}

// Configuração por ambiente
const config = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/zapchat_tur_dev.sqlite'),
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

// Instância Sequelize
const sequelize = new Sequelize(dbConfig);

// Inicialização completa do banco
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');

    if (process.env.DB_RECREATE_FORCE === 'true') {
      await sequelize.sync({ force: true });
      console.log('🔁 Modelos sincronizados com `force: true`');
    }

    //await runMigrations();

    if (process.env.DB_CREATE_DEVINFO === 'true') {
      console.log('🌱 Executando seed de desenvolvimento...');
      await seedDatabase();
      console.log('✅ Seed de desenvolvimento executado com sucesso.');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Utilitários auxiliares
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('✅ Conexão com banco de dados fechada.');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
  closeConnection,
  config
};
