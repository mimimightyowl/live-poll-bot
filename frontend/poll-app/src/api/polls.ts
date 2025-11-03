import { apiClient } from '@shared/api/client';
import type { Poll, PollOption, PollResults, ApiResponse } from '@shared/types';

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export const pollsApi = {
  async getAll(): Promise<Poll[]> {
    const response = await apiClient.get<ApiResponse<Poll[]>>('/polls');
    return response.data.data;
  },

  async getById(id: number): Promise<Poll> {
    const response = await apiClient.get<ApiResponse<Poll>>(`/polls/${id}`);
    return response.data.data;
  },

  async getWithOptions(id: number): Promise<PollWithOptions> {
    const [poll, options] = await Promise.all([
      pollsApi.getById(id),
      pollsApi.getOptions(id),
    ]);
    return { ...poll, options };
  },

  async getOptions(pollId: number): Promise<PollOption[]> {
    const response = await apiClient.get<ApiResponse<PollOption[]>>(
      `/polls/${pollId}/options`
    );
    return response.data.data;
  },

  async getResults(pollId: number): Promise<PollResults> {
    const response = await apiClient.get<ApiResponse<PollResults>>(
      `/polls/${pollId}/results`
    );
    return response.data.data;
  },
};
