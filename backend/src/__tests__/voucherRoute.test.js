const request = require('supertest');
const { app } = require('../server');
const JWTUtils = require('../utils/jwtUtils');
const { sequelize, Company, User, Customer, Trip, Sale, SalePayment, GeneralSetting } = require('../models');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'secret';
  await sequelize.sync({ force: true });

  const company = await Company.create({
    name: 'ViaTur Transportes',
    cnpj: '11.111.111/0001-11',
    email: 'contato@viatur.com'
  });

  await GeneralSetting.create({ company_id: company.id, guidelines: 'Siga as regras' });

  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: 'user@test.com',
    password: 'password',
    role: 'admin',
    company_id: company.id
  });

  const customer = await Customer.create({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '11999999999',
    company_id: company.id
  });

  const trip = await Trip.create({
    title: 'City Tour',
    maxPassengers: 10,
    priceTrips: 100,
    type: 'turismo',
    color: '#FFFFFF',
    company_id: company.id
  });

  const sale = await Sale.create({
    sale_number: 'VND-1',
    subtotal: 100,
    total_amount: 100,
    sale_date: new Date(),
    trip_id: trip.id,
    customer_id: customer.id,
    company_id: company.id,
    seller_id: user.id,
    created_by: user.id
  });

  await SalePayment.create({
    sale_id: sale.id,
    amount: 50,
    payment_method: 'dinheiro',
    payment_date: new Date()
  });

  global.testData = { user, sale };
});

afterAll(async () => {
  await sequelize.close();
});

test('voucher route returns PDF with basic info', async () => {
  const token = JWTUtils.generateAccessToken({
    userId: global.testData.user.id,
    email: global.testData.user.email,
    role: global.testData.user.role,
    company_id: global.testData.user.company_id,
    firstName: global.testData.user.firstName,
    lastName: global.testData.user.lastName
  });

  const res = await request(app)
    .get(`/api/sales/${global.testData.sale.id}/voucher`)
    .set('Authorization', `Bearer ${token}`)
    .buffer()
    .parse((res, cb) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => cb(null, Buffer.concat(chunks)));
    });

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/pdf/);
  const text = res.body.toString('utf8');
  expect(text).toContain('Voucher de Viagem');
  expect(text).toContain('ViaTur Transportes');
  expect(text).toContain('100');
});
