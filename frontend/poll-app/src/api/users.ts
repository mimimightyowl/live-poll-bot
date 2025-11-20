import { apiClient } from '@shared/api/client';
import type { User, ApiResponse } from '@shared/types';

export const usersApi = {
  async getByTelegramId(telegramId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      `/users/telegram/${telegramId}`
    );
    return response.data.data;
  },
};
