import usersClient, { User, GetOrCreateUserRequest } from './users.client';
import logger from '../../shared/logger';

class UsersService {
  async getOrCreateUser(
    telegramId: string,
    username: string,
    fullName?: string
  ): Promise<User> {
    try {
      const request: GetOrCreateUserRequest = {
        telegram_id: telegramId,
        username,
        full_name: fullName,
      };

      const response = await usersClient.getOrCreateUser(request);

      if (!response.success || !response.user) {
        throw new Error('Failed to get or create user');
      }

      return response.user;
    } catch (error) {
      logger.error('Error in UsersService.getOrCreateUser:', error as Error);
      throw error;
    }
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const response = await usersClient.getUserByTelegramId({
        telegram_id: telegramId,
      });

      if (!response.success || !response.user) {
        return null;
      }

      return response.user;
    } catch (error) {
      logger.error(
        'Error in UsersService.getUserByTelegramId:',
        error as Error
      );
      return null;
    }
  }
}

export default new UsersService();
