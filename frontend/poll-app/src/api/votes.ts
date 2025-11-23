import { apiClient } from '@shared/api/client';
import type { Vote, CreateVoteDto, ApiResponse } from '@shared/types';

export const votesApi = {
  async create(data: CreateVoteDto): Promise<Vote> {
    const response = await apiClient.post<ApiResponse<Vote>>('/votes', data);
    return response.data.data;
  },

  async checkVotingStatus(
    userId: number,
    pollId: number
  ): Promise<{ hasVoted: boolean }> {
    const response = await apiClient.get<ApiResponse<{ hasVoted: boolean }>>(
      '/votes/check',
      {
        params: { user_id: userId, poll_id: pollId },
      }
    );
    return response.data.data;
  },
};
