import { apiClient } from '@shared/api/client';
import type { Vote, CreateVoteDto, ApiResponse } from '@shared/types';

export const votesApi = {
  async create(data: CreateVoteDto): Promise<Vote> {
    const response = await apiClient.post<ApiResponse<Vote>>('/votes', data);
    return response.data.data;
  },
};
