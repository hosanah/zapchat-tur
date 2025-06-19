const request = require('supertest');
const { app } = require('./server');
const { initializeDatabase, closeConnection } = require('./config/database');
const { Company, User, GeneralSetting } = require('./models');

describe('Settings Endpoints', () => {
  let token;

  beforeAll(async () => {
    process.env.DB_RECREATE_FORCE = 'true';
    process.env.BCRYPT_ROUNDS = '4';
    await initializeDatabase();

    const company = await Company.create({
      name: 'Test Company',
      cnpj: '12345678000100',
      email: 'company@test.com'
    });

    await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: 'testpass',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      company_id: company.id
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'testpass' });
    token = res.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await closeConnection();
  });

  it('POST /api/settings should create settings', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ logo: Buffer.from('logo').toString('base64'), guidelines: 'Use mask' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/settings should retrieve settings', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.setting.guidelines).toBe('Use mask');
  });

  it('PUT /api/settings should update settings', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ guidelines: 'Updated guidelines' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.setting.guidelines).toBe('Updated guidelines');
  });

  it('DELETE /api/settings should remove settings', async () => {
    const res = await request(app)
      .delete('/api/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const setting = await GeneralSetting.findOne();
    expect(setting).toBeNull();
  });
});
