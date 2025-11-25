import { Context } from 'telegraf';
import usersHandler from '../users.handler';
import usersService from '../users.service';
import logger from '../../../shared/logger';

// Mock dependencies
jest.mock('../users.service');
jest.mock('../../../shared/logger');

describe('UsersHandler', () => {
  let mockCtx: Partial<Context>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      reply: jest.fn().mockResolvedValue(undefined),
      from: {
        id: 123456789,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        is_bot: false,
      },
    };
  });

  describe('ensureUser', () => {
    it('should return user id when user exists', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        telegram_id: '123456789',
        full_name: 'Test User',
        created_at: new Date(),
        updated_at: null,
      };

      (usersService.getOrCreateUser as jest.Mock).mockResolvedValue(mockUser);

      const userId = await usersHandler.ensureUser(mockCtx as Context);

      expect(userId).toBe(1);
      expect(usersService.getOrCreateUser).toHaveBeenCalledWith(
        '123456789',
        'testuser',
        'Test User'
      );
    });

    it('should return null when telegram id is missing', async () => {
      const ctxWithoutId = {
        ...mockCtx,
        from: undefined,
      };

      const userId = await usersHandler.ensureUser(ctxWithoutId as Context);

      expect(userId).toBeNull();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Telegram ID')
      );
    });

    it('should handle service errors gracefully', async () => {
      (usersService.getOrCreateUser as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const userId = await usersHandler.ensureUser(mockCtx as Context);

      expect(userId).toBeNull();
      expect(logger.error).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('ошибка')
      );
    });

    it('should use fallback username when username is missing', async () => {
      const ctxWithoutUsername = {
        ...mockCtx,
        from: {
          id: 123456789,
          username: undefined,
          first_name: 'Test',
        },
      };

      const mockUser = {
        id: 1,
        username: 'user_123456789',
        email: 'test@example.com',
        telegram_id: '123456789',
        full_name: 'Test',
        created_at: new Date(),
        updated_at: null,
      };

      (usersService.getOrCreateUser as jest.Mock).mockResolvedValue(mockUser);

      const userId = await usersHandler.ensureUser(
        ctxWithoutUsername as Context
      );

      expect(userId).toBe(1);
      expect(usersService.getOrCreateUser).toHaveBeenCalledWith(
        '123456789',
        'user_123456789',
        'Test'
      );
    });
  });
});
