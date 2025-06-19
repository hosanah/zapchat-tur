const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const { SequelizeStorage, Umzug } = require('umzug');
const { sequelize } = require('../config/database');

const umzug = new Umzug({
  migrations: {
  glob: path.join(__dirname, 'migrations', '*.js')
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function runMigrations() {
  try {
    const pending = await umzug.pending();
    if (pending.length > 0) {
      console.log(`🔧 Executando ${pending.length} migrations pendentes...`);
      await umzug.up();
      console.log('✅ Migrations executadas com sucesso.');
    } else {
      console.log('✅ Nenhuma migration pendente.');
    }
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    throw error;
  }
}

module.exports = { runMigrations };

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Falha ao executar migrations:', err);
      process.exit(1);
    });
}
