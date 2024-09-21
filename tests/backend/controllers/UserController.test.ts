import { UserController } from 'src/backend/controllers/UserController';
import { UserService } from 'src/backend/services/UserService';
import { ConnectionService } from 'src/backend/services/ConnectionService';
import { NetworkValueService } from 'src/backend/services/NetworkValueService';
import { Request, Response, NextFunction } from 'express';
import { UserError } from 'src/backend/errors/UserError';

jest.mock('src/backend/services/UserService');
jest.mock('src/backend/services/ConnectionService');
jest.mock('src/backend/services/NetworkValueService');

const mockRequest = (options: Partial<Request> = {}): Partial<Request> => {
  return {
    params: {},
    body: {},
    query: {},
    ...options,
  };
};

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNextFunction: NextFunction = jest.fn();

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockConnectionService: jest.Mocked<ConnectionService>;
  let mockNetworkValueService: jest.Mocked<NetworkValueService>;

  beforeEach(() => {
    mockUserService = new UserService() as jest.Mocked<UserService>;
    mockConnectionService = new ConnectionService() as jest.Mocked<ConnectionService>;
    mockNetworkValueService = new NetworkValueService() as jest.Mocked<NetworkValueService>;
    userController = new UserController(mockUserService, mockConnectionService, mockNetworkValueService);
  });

  describe('getUserProfile', () => {
    it('returns user profile successfully', async () => {
      const mockUser = { id: '123', username: 'testuser' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const req = mockRequest({ params: { userId: '123' } });
      const res = mockResponse();

      await userController.getUserProfile(req as Request, res as Response, mockNextFunction);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateUserProfile', () => {
    it('updates profile successfully', async () => {
      const mockUser = { id: '123', username: 'updateduser' };
      const updateData = { username: 'updateduser' };
      mockUserService.updateUserProfile.mockResolvedValue(mockUser);

      const req = mockRequest({ params: { userId: '123' }, body: updateData });
      const res = mockResponse();

      await userController.updateUserProfile(req as Request, res as Response, mockNextFunction);

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith('123', updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUserConnections', () => {
    it('returns connections successfully', async () => {
      const mockConnections = [{ id: '456', userId1: '123', userId2: '789' }];
      mockConnectionService.getUserConnections.mockResolvedValue(mockConnections);

      const req = mockRequest({ params: { userId: '123' } });
      const res = mockResponse();

      await userController.getUserConnections(req as Request, res as Response, mockNextFunction);

      expect(mockConnectionService.getUserConnections).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockConnections);
    });
  });

  describe('createConnection', () => {
    it('creates a new connection successfully', async () => {
      const mockConnection = { id: '456', userId1: '123', userId2: '789' };
      mockConnectionService.createConnection.mockResolvedValue(mockConnection);

      const req = mockRequest({ body: { userId: '789' }, user: { id: '123' } });
      const res = mockResponse();

      await userController.createConnection(req as Request, res as Response, mockNextFunction);

      expect(mockConnectionService.createConnection).toHaveBeenCalledWith('123', '789');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockConnection);
    });
  });

  describe('getUserNetworkValue', () => {
    it('returns network value successfully', async () => {
      const mockNetworkValue = { userId: '123', value: 100 };
      mockNetworkValueService.getNetworkValue.mockResolvedValue(mockNetworkValue);

      const req = mockRequest({ params: { userId: '123' } });
      const res = mockResponse();

      await userController.getUserNetworkValue(req as Request, res as Response, mockNextFunction);

      expect(mockNetworkValueService.getNetworkValue).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockNetworkValue);
    });
  });

  describe('searchUsers', () => {
    it('returns search results successfully', async () => {
      const mockSearchResults = [{ id: '123', username: 'testuser' }];
      mockUserService.searchUsers.mockResolvedValue(mockSearchResults);

      const req = mockRequest({ query: { keyword: 'test' } });
      const res = mockResponse();

      await userController.searchUsers(req as Request, res as Response, mockNextFunction);

      expect(mockUserService.searchUsers).toHaveBeenCalledWith({ keyword: 'test' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSearchResults);
    });
  });
});