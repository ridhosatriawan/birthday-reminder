import mongoose from 'mongoose';
import request from 'supertest';
import { web } from '../../api/applications/web';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

describe('User API Integration Tests', () => {
  let userId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userPayload = {
        name: 'Ridho',
        email: 'ridho@mail.com',
        birthday: '1990-01-01',
        timezone: 'Asia/Jakarta',
      };
      const res = await request(web)
        .post('/api/users')
        .send(userPayload)
        .expect(201);

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe(userPayload.name);
      userId = res.body.data._id;
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(web)
        .post('/api/users')
        .send({ name: 'Ri' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/:_id', () => {
    it('should get user by ID', async () => {
      const res = await request(web).get(`/api/users/${userId}`).expect(200);

      expect(res.body.data).toHaveProperty('_id', userId);
      expect(res.body.data).toHaveProperty('name', 'Ridho');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await request(web).get(`/api/users/${fakeId}`).expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/users/:_id', () => {
    it('should update user data', async () => {
      const updatePayload = {
        name: 'Alice Updated',
      };

      const res = await request(web)
        .patch(`/api/users/${userId}`)
        .send(updatePayload)
        .expect(200);

      expect(res.body.data).toHaveProperty('name', updatePayload.name);
    });

    it('should return 400 for invalid update', async () => {
      const res = await request(web)
        .patch(`/api/users/${userId}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/users/:_id', () => {
    it('should delete user', async () => {
      await request(web).delete(`/api/users/${userId}`).expect(204);
    });

    it('should return 404 for deleting non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();

      const res = await request(web).delete(`/api/users/${fakeId}`).expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });
});
