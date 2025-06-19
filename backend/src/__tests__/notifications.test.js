const request = require('supertest');
const { app } = require('../server');
const { initializeDatabase, closeConnection } = require('../config/database');
const { User, Notification, Company } = require('../models');

describe('Notifications Endpoints', () => {
  let token;
  let user;

  beforeAll(async () => {
    process.env.DB_RECREATE_FORCE = 'true';
    process.env.BCRYPT_ROUNDS = '4';
    await initializeDatabase();

    const company = await Company.create({
      name: 'Notify Co',
      cnpj: '12345678000199',
      email: 'c@c.com'
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
  });

  afterAll(async () => {
    await closeConnection();
  });

  it('POST /api/notifications should create a notification', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.notification.content).toBe('Hello');
  });

  it('GET /api/notifications should list notifications', async () => {
    await Notification.create({ user_id: user.id, content: 'Another' });
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/notifications/:id/read should mark notification as read', async () => {
    const notification = await Notification.create({ user_id: user.id, content: 'Read me' });
    const res = await request(app)
      .patch(`/api/notifications/${notification.id}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    const updated = await Notification.findByPk(notification.id);
    expect(updated.read).toBe(true);
  });
});
