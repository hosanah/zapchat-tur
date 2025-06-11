const path = require('path');
const { SequelizeStorage, Umzug } = require('umzug');
const { sequelize } = require('../config/database');

const umzug = new Umzug({
  migrations: { glob: path.join(__dirname, 'migrations/*.js') },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function runMigrations() {
  try {
    const pending = await umzug.pending();
    if (pending.length > 0) {
      console.log(`\uD83D\uDEE0 Executando ${pending.length} migrations pendentes...`);
      await umzug.up();
      console.log('\u2705 Migrations executadas com sucesso.');
    } else {
      console.log('\u2705 Nenhuma migration pendente.');
    }
  } catch (error) {
    console.error('\u274C Erro ao executar migrations:', error);
    throw error;
  }
}

module.exports = { runMigrations };
