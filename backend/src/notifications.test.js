const request = require('supertest');
const { app } = require('./server');
const { initializeDatabase, closeConnection } = require('./config/database');
const { Company, User, Notification } = require('./models');

describe('Notifications Endpoints', () => {
  let token;
  let user;

  beforeAll(async () => {
    process.env.DB_RECREATE_FORCE = 'true';
    process.env.BCRYPT_ROUNDS = '4';
    await initializeDatabase();

    const company = await Company.create({
      name: 'Notify Co',
      cnpj: '00000000000100',
      email: 'notify@co.com'
    });

    user = await User.create({
      firstName: 'Notify',
      lastName: 'User',
      email: 'notify@test.com',
      password: 'testpass',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      company_id: company.id
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notify@test.com', password: 'testpass' });
    token = res.body.data.tokens.accessToken;

    await Notification.bulkCreate([
      { user_id: user.id, message: 'N1' },
      { user_id: user.id, message: 'N2' }
    ]);
  });

  afterAll(async () => {
    await closeConnection();
  });

  it('GET /api/notifications should list notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.notifications.length).toBe(2);
  });

  it('PATCH /api/notifications/:id/read should mark as read', async () => {
    const notification = await Notification.findOne({ where: { user_id: user.id } });
    const res = await request(app)
      .patch(`/api/notifications/${notification.id}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    const updated = await Notification.findByPk(notification.id);
    expect(updated.read).toBe(true);
  });
});
