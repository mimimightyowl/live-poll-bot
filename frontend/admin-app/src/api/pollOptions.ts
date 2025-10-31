import type { PollOption, CreatePollOptionDto, ApiResponse } from '@/types';
import { apiClient } from '@shared/api/client';

export const pollOptionsApi = {
  async getByPollId(pollId: number): Promise<PollOption[]> {
    const response = await apiClient.get<ApiResponse<PollOption[]>>(
      `/polls/${pollId}/options`
    );
    return response.data.data;
  },

  async create(data: CreatePollOptionDto): Promise<PollOption> {
    const { poll_id } = data;
    const response = await apiClient.post<ApiResponse<PollOption>>(
      `/polls/${poll_id}/options`,
      data
    );
    return response.data.data;
  },

  async delete(pollId: number, poll_option_id: number): Promise<void> {
    await apiClient.delete(`/polls/${pollId}/options/${poll_option_id}`);
  },
};
