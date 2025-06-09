const request = require('supertest');
const { app } = require('../server');
const { sequelize, Company, User, Seller } = require('../models');

describe('Seller Routes', () => {
  let tokenA;
  let tokenB;
  let companyA;
  let companyB;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    companyA = await Company.create({
      name: 'Empresa A',
      cnpj: '11.111.111/1111-11',
      email: 'a@ex.com'
    });
    companyB = await Company.create({
      name: 'Empresa B',
      cnpj: '22.222.222/2222-22',
      email: 'b@ex.com'
    });

    const userA = await User.create({
      firstName: 'User',
      lastName: 'AdminA',
      email: 'usera@ex.com',
      password: 'secret123',
      role: 'admin',
      company_id: companyA.id
    });
    const userB = await User.create({
      firstName: 'User',
      lastName: 'AdminB',
      email: 'userb@ex.com',
      password: 'secret123',
      role: 'admin',
      company_id: companyB.id
    });

    const loginA = await request(app)
      .post('/api/auth/login')
      .send({ email: userA.email, password: 'secret123' });
    tokenA = loginA.body.data.tokens.accessToken;

    const loginB = await request(app)
      .post('/api/auth/login')
      .send({ email: userB.email, password: 'secret123' });
    tokenB = loginB.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should require authentication to create seller', async () => {
    const res = await request(app)
      .post('/api/sellers')
      .send({ firstName: 'John', lastName: 'Doe' });
    expect(res.statusCode).toBe(401);
  });

  it('should allow authenticated creation of seller', async () => {
    const res = await request(app)
      .post('/api/sellers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ firstName: 'John', lastName: 'Doe', email: 'john@ex.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data.seller.id');
    const seller = await Seller.findOne({ where: { email: 'john@ex.com' } });
    expect(seller).not.toBeNull();
    expect(seller.company_id).toBe(companyA.id);
  });

  it('should list only sellers from authenticated user company', async () => {
    await request(app)
      .post('/api/sellers')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ firstName: 'Jane', lastName: 'Smith', email: 'jane@ex.com' });

    const res = await request(app)
      .get('/api/sellers')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    const sellers = res.body.data.sellers;
    expect(sellers).toHaveLength(1);
    expect(sellers[0].email).toBe('john@ex.com');
  });
});
