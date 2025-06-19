const request = require('supertest');
const express = require('express');
const uploadLogo = require('./uploadLogo');

const app = express();
app.post('/upload', uploadLogo, (req, res) => {
  res.status(200).json({ received: !!req.file });
});
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

describe('uploadLogo middleware', () => {
  it('accepts a valid image', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('logo', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true });
  });

  it('rejects invalid file type', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('logo', Buffer.from('hello'), 'test.txt');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
