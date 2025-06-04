const { Company, User } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Seeder para dados iniciais do sistema
 */
async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seeding do banco de dados...');

    // Verificar se já existem dados
    const existingCompanies = await Company.count();
    const existingUsers = await User.count();

    if (existingCompanies > 0 || existingUsers > 0) {
      console.log('📊 Dados já existem no banco. Pulando seeding.');
      return;
    }

    // Criar empresa de exemplo
    const exampleCompany = await Company.create({
      name: 'Turismo Exemplo Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@turismoexemplo.com.br',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      website: 'https://turismoexemplo.com.br',
      description: 'Empresa de turismo especializada em passeios ecológicos e aventura.',
      isActive: true,
      settings: {
        theme: 'light',
        notifications: true,
        timezone: 'America/Sao_Paulo'
      }
    });

    console.log('✅ Empresa exemplo criada:', exampleCompany.name);

    // Criar usuário master
    const masterUser = await User.create({
      firstName: 'Admin',
      lastName: 'Master',
      email: 'admin@zapchattur.com',
      password: 'admin123456',
      role: 'master',
      isActive: true,
      emailVerified: true,
      company_id: null // Usuário master não tem empresa específica
    });

    console.log('✅ Usuário master criado:', masterUser.email);

    // Criar usuário admin da empresa
    const adminUser = await User.create({
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@turismoexemplo.com.br',
      password: 'senha123456',
      phone: '(11) 98888-8888',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      company_id: exampleCompany.id
    });

    console.log('✅ Usuário admin criado:', adminUser.email);

    // Criar usuário comum da empresa
    const commonUser = await User.create({
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria@turismoexemplo.com.br',
      password: 'senha123456',
      phone: '(11) 97777-7777',
      role: 'user',
      isActive: true,
      emailVerified: true,
      company_id: exampleCompany.id
    });

    console.log('✅ Usuário comum criado:', commonUser.email);

    console.log('🎉 Seeding concluído com sucesso!');
    console.log('');
    console.log('📋 Dados criados:');
    console.log('   - 1 empresa exemplo');
    console.log('   - 1 usuário master (admin@zapchattur.com)');
    console.log('   - 1 usuário admin da empresa');
    console.log('   - 1 usuário comum da empresa');
    console.log('');
    console.log('🔑 Credenciais de acesso:');
    console.log('   Master: admin@zapchattur.com / admin123456');
    console.log('   Admin:  joao@turismoexemplo.com.br / senha123456');
    console.log('   User:   maria@turismoexemplo.com.br / senha123456');

  } catch (error) {
    console.error('❌ Erro durante seeding:', error);
    throw error;
  }
}

/**
 * Limpar dados do banco (apenas em desenvolvimento)
 */
async function clearDatabase() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Limpeza do banco só é permitida em desenvolvimento');
    }

    console.log('🧹 Limpando banco de dados...');
    
    await User.destroy({ where: {} });
    await Company.destroy({ where: {} });
    
    console.log('✅ Banco de dados limpo!');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    throw error;
  }
}

module.exports = {
  seedDatabase,
  clearDatabase
};

