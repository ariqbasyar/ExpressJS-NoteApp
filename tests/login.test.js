const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Login API', () => {
  beforeEach(async () => {
    // Create a dummy user before each test
    const user = await User.createWithPassword('username99', 'email99@email.com', 'password99');
  });

  afterEach(async () => {
    // Delete the dummy user after each test
    await User.deleteByUsername('username99');
  });

  it('should return 403 if username or email is missing', async () => {
    const response = await request(app).post('/api/login').send({ password: 'password99' });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Username or email does not match with given password');
  });

  it('should return 403 if password is missing', async () => {
    const response = await request(app).post('/api/login').send({ username: 'username99', email: 'email99@email.com' });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Username or email does not match with given password');
  });

  it('should return 403 if username or email is invalid', async () => {
    const response = await request(app).post('/api/login').send({ username: 'invalid', password: 'password99' });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Username or email does not match with given password');
  });

  it('should return a token if login is successful', async () => {
    const response = await request(app).post('/api/login').send(
      { username: 'username99', email: 'email99@email.com', password: 'password99' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });
});