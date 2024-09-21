import request from 'supertest';
import { app } from 'src/backend/app';
import { User } from 'src/backend/models/User';
import { Industry } from 'src/backend/models/Industry';
import { Interest } from 'src/backend/models/Interest';
import { Connection } from 'src/backend/models/Connection';
import { NetworkValue } from 'src/backend/models/NetworkValue';
import { UserService } from 'src/backend/services/UserService';
import { ConnectionService } from 'src/backend/services/ConnectionService';
import { NetworkValueService } from 'src/backend/services/NetworkValueService';
import { connectToDatabase, disconnectFromDatabase } from 'src/backend/config/database';

let testUsers: User[] = [];

async function setupTestDatabase(): Promise<void> {
  await connectToDatabase('test');
  await User.destroy({ where: {} });
  await Industry.destroy({ where: {} });
  await Interest.destroy({ where: {} });

  const industries = await Industry.bulkCreate([
    { name: 'Technology' },
    { name: 'Finance' },
    { name: 'Healthcare' }
  ]);

  const interests = await Interest.bulkCreate([
    { name: 'Artificial Intelligence' },
    { name: 'Blockchain' },
    { name: 'Renewable Energy' }
  ]);

  testUsers = await User.bulkCreate([
    { phoneNumber: '+11234567890', username: 'testuser1' },
    { phoneNumber: '+10987654321', username: 'testuser2' }
  ]);
}

async function teardownTestDatabase(): Promise<void> {
  await User.destroy({ where: {} });
  await Industry.destroy({ where: {} });
  await Interest.destroy({ where: {} });
  await Connection.destroy({ where: {} });
  await NetworkValue.destroy({ where: {} });
  await disconnectFromDatabase();
}

async function authenticateUser(phoneNumber: string): Promise<string> {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ phoneNumber });
  return response.body.token;
}

describe('User Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('User profile management', () => {
    it('should allow retrieving and updating user profile', async () => {
      const token = await authenticateUser(testUsers[0].phoneNumber);
      
      // Get initial profile
      const getResponse = await request(app)
        .get(`/api/v1/users/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.username).toBe('testuser1');

      // Update profile
      const updateResponse = await request(app)
        .put(`/api/v1/users/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'updateduser1' });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.username).toBe('updateduser1');

      // Verify changes
      const verifyResponse = await request(app)
        .get(`/api/v1/users/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.username).toBe('updateduser1');
    });

    it('should not allow updating another user\'s profile', async () => {
      const token = await authenticateUser(testUsers[0].phoneNumber);
      
      const response = await request(app)
        .put(`/api/v1/users/${testUsers[1].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'hacker' });
      expect(response.status).toBe(403);
    });
  });

  describe('Connection management', () => {
    it('should allow creating and retrieving connections', async () => {
      const token1 = await authenticateUser(testUsers[0].phoneNumber);
      const token2 = await authenticateUser(testUsers[1].phoneNumber);

      // Create connection
      const createResponse = await request(app)
        .post('/api/v1/connections')
        .set('Authorization', `Bearer ${token1}`)
        .send({ userId: testUsers[1].id });
      expect(createResponse.status).toBe(201);

      // Retrieve connections
      const getResponse = await request(app)
        .get(`/api/v1/connections/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toContainEqual(expect.objectContaining({
        userId1: testUsers[0].id,
        userId2: testUsers[1].id
      }));

      // Attempt duplicate connection
      const duplicateResponse = await request(app)
        .post('/api/v1/connections')
        .set('Authorization', `Bearer ${token1}`)
        .send({ userId: testUsers[1].id });
      expect(duplicateResponse.status).toBe(400);

      // Remove connection
      const removeResponse = await request(app)
        .delete(`/api/v1/connections/${testUsers[1].id}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(removeResponse.status).toBe(200);

      // Verify removal
      const verifyResponse = await request(app)
        .get(`/api/v1/connections/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(verifyResponse.body).not.toContainEqual(expect.objectContaining({
        userId1: testUsers[0].id,
        userId2: testUsers[1].id
      }));
    });
  });

  describe('Network value calculation', () => {
    it('should calculate and update network value', async () => {
      const token = await authenticateUser(testUsers[0].phoneNumber);

      // Get initial network value
      const initialResponse = await request(app)
        .get(`/api/v1/network-value/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(initialResponse.status).toBe(200);
      const initialValue = initialResponse.body.value;

      // Create connections
      await request(app)
        .post('/api/v1/connections')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: testUsers[1].id });

      // Get updated network value
      const updatedResponse = await request(app)
        .get(`/api/v1/network-value/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(updatedResponse.status).toBe(200);
      expect(updatedResponse.body.value).toBeGreaterThan(initialValue);
    });
  });

  describe('User search functionality', () => {
    it('should return accurate search results', async () => {
      const token = await authenticateUser(testUsers[0].phoneNumber);

      const searchResponse = await request(app)
        .get('/api/v1/users/search?industry=Technology&interest=Blockchain')
        .set('Authorization', `Bearer ${token}`);
      expect(searchResponse.status).toBe(200);
      expect(Array.isArray(searchResponse.body.users)).toBe(true);
      // Add more specific assertions based on your search implementation
    });
  });

  describe('Industry and interest management', () => {
    it('should allow adding and removing industries and interests', async () => {
      const token = await authenticateUser(testUsers[0].phoneNumber);

      // Add industries and interests
      const addResponse = await request(app)
        .put(`/api/v1/users/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          industries: ['Technology', 'Finance'],
          interests: ['Artificial Intelligence', 'Blockchain']
        });
      expect(addResponse.status).toBe(200);
      expect(addResponse.body.industries).toHaveLength(2);
      expect(addResponse.body.interests).toHaveLength(2);

      // Attempt to add more than maximum allowed
      const maxResponse = await request(app)
        .put(`/api/v1/users/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          industries: ['Technology', 'Finance', 'Healthcare', 'Education'],
          interests: ['AI', 'Blockchain', 'Renewable Energy', 'IoT', 'Big Data']
        });
      expect(maxResponse.status).toBe(400);

      // Remove industries and interests
      const removeResponse = await request(app)
        .put(`/api/v1/users/${testUsers[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          industries: ['Technology'],
          interests: ['Artificial Intelligence']
        });
      expect(removeResponse.status).toBe(200);
      expect(removeResponse.body.industries).toHaveLength(1);
      expect(removeResponse.body.interests).toHaveLength(1);
    });
  });
});