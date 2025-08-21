import mongoose from 'mongoose';
import { User } from '../../model/User.js';
import createApp from '../../server.js';
import request from 'supertest';

let app, AdminToken, regularToken;

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'TestPass123!',
  role: 'USER',
};

const adminUser = {
  username: 'adminuser',
  email: 'admin@example.com',
  password: 'AdminPass123!',
  role: 'ADMIN',
};

beforeAll(async () => {
  const app = await createApp;

  // Create test
  await User.deleteMany({});
  await User.create(adminUser);
  await User.create(testUser);

  // Login to get token
  const adminRes = await request(app)
    .post('/api/v1/auth')
    .send({ email: adminUser.email, password: adminUser.password });
  AdminToken = adminRes.body.accessToken;

  const userRes = await request(app)
    .post('/api/v1/auth')
    .send({ email: testUser.email, password: testUser.password });
  regularToken = userRes.body.acessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User API', () => {
  describe('GET /api/v1/users', () => {
    it('should return 403 for non-admin users', async () => {
      console.log(regularToken);
      await request(app)
        .get('/api/v1/users')
        .set('authorization', `Bearer ${regularToken}`)
        .expect(403);
    });
  });
});
