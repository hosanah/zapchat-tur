const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();


let seedDatabase;
try {
  // Permite indicar qual seeder usar via variável DB_CREATE_DEVINFO
  const seederFile =
    process.env.DB_CREATE_DEVINFO && process.env.DB_CREATE_DEVINFO !== 'true'
      ? process.env.DB_CREATE_DEVINFO
      : 'seeders';
  seedDatabase = require(path.join('..', 'database', seederFile)).seedDatabase;
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
    dialect: 'postgres',
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

// Executa arquivos SQL de migrations de forma sequencial
async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../database/migrations');
  if (!fs.existsSync(migrationsDir)) return;

  await sequelize.query(`CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const executed = await sequelize.query(
      'SELECT name FROM migrations WHERE name = ? LIMIT 1',
      { replacements: [file], type: Sequelize.QueryTypes.SELECT }
    );

    if (executed.length === 0) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const stmt of statements) {
        await sequelize.query(stmt);
      }
      await sequelize.query('INSERT INTO migrations (name) VALUES (?)', {
        replacements: [file]
      });
      console.log(`✅ Migration executada: ${file}`);
    }
  }
}

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

    if (process.env.DB_CREATE_DEVINFO) {
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
