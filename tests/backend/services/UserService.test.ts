import { UserService } from 'src/backend/services/UserService';
import { User } from 'src/backend/models/User';
import { Industry } from 'src/backend/models/Industry';
import { Interest } from 'src/backend/models/Interest';
import { Connection } from 'src/backend/models/Connection';
import { NetworkValue } from 'src/backend/models/NetworkValue';
import { UserError } from 'src/backend/errors/UserError';
import { sequelize } from 'src/backend/config/database';

// Mock functions
const mockUserModel = () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

const mockIndustryModel = () => ({
  findAll: jest.fn(),
});

const mockInterestModel = () => ({
  findAll: jest.fn(),
});

const mockConnectionModel = () => ({
  findAll: jest.fn(),
});

const mockNetworkValueModel = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let mockUser: any;
  let mockIndustry: any;
  let mockInterest: any;
  let mockConnection: any;
  let mockNetworkValue: any;

  beforeEach(() => {
    mockUser = mockUserModel();
    mockIndustry = mockIndustryModel();
    mockInterest = mockInterestModel();
    mockConnection = mockConnectionModel();
    mockNetworkValue = mockNetworkValueModel();

    userService = new UserService(
      mockUser as any,
      mockIndustry as any,
      mockInterest as any,
      mockConnection as any,
      mockNetworkValue as any
    );
  });

  describe('getUserById', () => {
    it('returns user with associated data', async () => {
      const mockUserId = '123';
      const mockUserData = {
        id: mockUserId,
        username: 'testuser',
        industries: [{ id: '1', name: 'Tech' }],
        interests: [{ id: '1', name: 'AI' }],
      };

      mockUser.findByPk.mockResolvedValue(mockUserData);

      const result = await userService.getUserById(mockUserId);

      expect(mockUser.findByPk).toHaveBeenCalledWith(mockUserId, expect.any(Object));
      expect(result).toEqual(mockUserData);
      expect(result.industries).toBeDefined();
      expect(result.interests).toBeDefined();
    });
  });

  describe('updateUserProfile', () => {
    it('updates user data correctly', async () => {
      const mockUserId = '123';
      const mockUpdateData = {
        username: 'updateduser',
        industries: ['1', '2'],
        interests: ['1', '2'],
      };
      const mockUpdatedUser = { ...mockUpdateData, id: mockUserId };

      mockUser.update.mockResolvedValue(mockUpdatedUser);
      mockIndustry.findAll.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      mockInterest.findAll.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const result = await userService.updateUserProfile(mockUserId, mockUpdateData);

      expect(mockUser.update).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('getUserConnections', () => {
    it('returns correct connections for a user', async () => {
      const mockUserId = '123';
      const mockConnections = [
        { id: '1', userId1: mockUserId, userId2: '456' },
        { id: '2', userId1: '789', userId2: mockUserId },
      ];

      mockConnection.findAll.mockResolvedValue(mockConnections);

      const result = await userService.getUserConnections(mockUserId);

      expect(mockConnection.findAll).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(mockConnections);
    });
  });

  describe('getUserNetworkValue', () => {
    it('returns correct network value for a user', async () => {
      const mockUserId = '123';
      const mockNetworkValueData = { userId: mockUserId, value: 100 };

      mockNetworkValue.findOne.mockResolvedValue(mockNetworkValueData);

      const result = await userService.getUserNetworkValue(mockUserId);

      expect(mockNetworkValue.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(mockNetworkValueData);
    });
  });

  describe('searchUsers', () => {
    it('returns users based on search criteria', async () => {
      const mockSearchParams = { industry: 'Tech', interest: 'AI' };
      const mockUsers = [
        { id: '1', username: 'user1', industries: [{ name: 'Tech' }], interests: [{ name: 'AI' }] },
        { id: '2', username: 'user2', industries: [{ name: 'Tech' }], interests: [{ name: 'AI' }] },
      ];

      mockUser.findAll.mockResolvedValue(mockUsers);

      const result = await userService.searchUsers(mockSearchParams);

      expect(mockUser.findAll).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(mockUsers);
    });
  });
});