const request = require('supertest');
const { app } = require('./server');

describe('Health Check', () => {
  it('should return status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});
