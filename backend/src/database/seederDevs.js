const {
  Company,
  User,
  Driver,
  Vehicle,
  Trip,
  Customer,
  Sale,
  GeneralSetting
} = require('../models');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seeding de desenvolvimento...');

    const hasCompanies = await Company.count();
    if (hasCompanies) {
      console.log('📊 Dados já existem. Pulando seeding.');
      return;
    }

    // Criar empresas
    const companies = await Company.bulkCreate([
      {
        name: 'ViaTur Transportes',
        cnpj: '11.111.111/0001-11',
        email: 'contato@viatur.com',
        phone: '(11) 90000-0001',
        city: 'São Paulo',
        state: 'SP'
      },
      {
        name: 'Expresso Sertao',
        cnpj: '22.222.222/0001-22',
        email: 'contato@expressosertao.com',
        phone: '(21) 90000-0002',
        city: 'Rio de Janeiro',
        state: 'RJ'
      },
      {
        name: 'Rota Central Viagens',
        cnpj: '33.333.333/0001-33',
        email: 'contato@rotacentral.com',
        phone: '(31) 90000-0003',
        city: 'Belo Horizonte',
        state: 'MG'
      }
    ], { returning: true });

    // Configuração geral para primeira empresa
    await GeneralSetting.create({
      company_id: companies[0].id,
      guidelines: 'Siga as regras de segurança nas viagens.'
    });

    // Criar usuários
    const admins = {};
    for (const [idx, company] of companies.entries()) {
      const admin = await User.create({
        firstName: 'Admin',
        lastName: `Empresa${idx + 1}`,
        email: `admin${idx + 1}@example.com`,
        password: 'senha123456',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        company_id: company.id
      });
      admins[company.id] = admin;

      for (let u = 1; u <= 2; u++) {
        await User.create({
          firstName: `User${u}`,
          lastName: `Empresa${idx + 1}`,
          email: `user${u}_c${idx + 1}@example.com`,
          password: 'senha123456',
          role: 'user',
          isActive: true,
          emailVerified: true,
          company_id: company.id
        });
      }
    }

    // Criar motoristas
    const drivers = await Driver.bulkCreate([
      {
        firstName: 'Carlos',
        lastName: 'Silva',
        cpf: '000.000.000-01',
        birthDate: '1980-01-01',
        phone: '(11) 91111-0001',
        licenseNumber: 'LIC1001',
        licenseCategory: 'D',
        licenseExpiry: '2030-12-31',
        company_id: companies[0].id
      },
      {
        firstName: 'Marcio',
        lastName: 'Souza',
        cpf: '000.000.000-02',
        birthDate: '1982-02-02',
        phone: '(21) 92222-0002',
        licenseNumber: 'LIC1002',
        licenseCategory: 'D',
        licenseExpiry: '2030-12-31',
        company_id: companies[1].id
      },
      {
        firstName: 'Paulo',
        lastName: 'Oliveira',
        cpf: '000.000.000-03',
        birthDate: '1983-03-03',
        phone: '(31) 93333-0003',
        licenseNumber: 'LIC1003',
        licenseCategory: 'D',
        licenseExpiry: '2030-12-31',
        company_id: companies[2].id
      },
      {
        firstName: 'Roberto',
        lastName: 'Lima',
        cpf: '000.000.000-04',
        birthDate: '1979-04-04',
        phone: '(11) 94444-0004',
        licenseNumber: 'LIC1004',
        licenseCategory: 'D',
        licenseExpiry: '2030-12-31',
        company_id: companies[0].id
      },
      {
        firstName: 'Fernando',
        lastName: 'Gomes',
        cpf: '000.000.000-05',
        birthDate: '1985-05-05',
        phone: '(21) 95555-0005',
        licenseNumber: 'LIC1005',
        licenseCategory: 'D',
        licenseExpiry: '2030-12-31',
        company_id: companies[1].id
      }
    ], { returning: true });

    // Criar veículos
    const vehicles = await Vehicle.bulkCreate([
      {
        plate: 'AAA0A01',
        brand: 'Mercedes',
        model: 'Sprinter',
        year: 2020,
        color: 'Branco',
        capacity: 15,
        type: 'van',
        fuel: 'diesel',
        company_id: companies[0].id
      },
      {
        plate: 'BBB0B02',
        brand: 'Volkswagen',
        model: 'Crafter',
        year: 2021,
        color: 'Prata',
        capacity: 20,
        type: 'van',
        fuel: 'diesel',
        company_id: companies[1].id
      },
      {
        plate: 'CCC0C03',
        brand: 'Fiat',
        model: 'Ducato',
        year: 2019,
        color: 'Azul',
        capacity: 15,
        type: 'van',
        fuel: 'diesel',
        company_id: companies[2].id
      },
      {
        plate: 'DDD0D04',
        brand: 'Renault',
        model: 'Master',
        year: 2018,
        color: 'Branco',
        capacity: 16,
        type: 'van',
        fuel: 'diesel',
        company_id: companies[0].id
      },
      {
        plate: 'EEE0E05',
        brand: 'Iveco',
        model: 'Daily',
        year: 2022,
        color: 'Preto',
        capacity: 18,
        type: 'van',
        fuel: 'diesel',
        company_id: companies[1].id
      }
    ], { returning: true });

    // Criar viagens
    const tripsByCompany = {};
    for (const company of companies) {
      tripsByCompany[company.id] = [];
      for (let t = 1; t <= 5; t++) {
        const trip = await Trip.create({
          title: `Viagem ${t} - ${company.name}`,
          description: 'Passeio de demonstração',
          maxPassengers: 40,
          priceTrips: 100 + t,
          type: 'turismo',
          status: 'ativo',
          company_id: company.id
        });
        tripsByCompany[company.id].push(trip);
      }
    }

    // Criar clientes
    const customersByCompany = {};
    for (const [idx, company] of companies.entries()) {
      customersByCompany[company.id] = [];
      for (let c = 1; c <= 10; c++) {
        const customer = await Customer.create({
          firstName: `Cliente${c}`,
          lastName: `Empresa${idx + 1}`,
          email: `cliente${c}_c${idx + 1}@example.com`,
          phone: '(11)90000-1234',
          company_id: company.id
        });
        customersByCompany[company.id].push(customer);
      }
    }

    // Criar vendas
    const today = new Date();
    const sales = [];
    for (let s = 0; s < 30; s++) {
      const company = companies[s % companies.length];
      const tripList = tripsByCompany[company.id];
      const custList = customersByCompany[company.id];

      const saleDate = new Date(today);
      saleDate.setDate(saleDate.getDate() + s);
      const dueDate = new Date(saleDate);
      dueDate.setDate(dueDate.getDate() + 7);

      sales.push({
        description: 'Venda gerada pelo seeder',
        subtotal: 200,
        discount_amount: 0,
        tax_amount: 0,
        commission_percentage: 10,
        status: 'confirmada',
        payment_status: 'pendente',
        sale_date: saleDate,
        due_date: dueDate,
        installments: 1,
        trip_id: tripList[s % tripList.length].id,
        customer_id: custList[s % custList.length].id,
        company_id: company.id,
        seller_id: admins[company.id].id,
        created_by: admins[company.id].id
      });
    }

    await Sale.bulkCreate(sales);

    console.log('🎉 Seeder de desenvolvimento concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro no seeder de desenvolvimento:', err);
    throw err;
  }
}

module.exports = { seedDatabase };
