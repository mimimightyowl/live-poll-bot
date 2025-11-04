import { apiClient } from './client';
import type {
  Poll,
  CreatePollDto,
  UpdatePollDto,
  PollResults,
  ApiResponse,
} from '../types';

export const pollsApi = {
  async getAll(): Promise<Poll[]> {
    const response = await apiClient.get<ApiResponse<Poll[]>>('/polls');
    return response.data.data;
  },

  async getById(id: number): Promise<Poll> {
    const response = await apiClient.get<ApiResponse<Poll>>(`/polls/${id}`);
    return response.data.data;
  },

  async create(data: CreatePollDto): Promise<Poll> {
    const response = await apiClient.post<ApiResponse<Poll>>('/polls', data);
    return response.data.data;
  },

  async update(id: number, data: UpdatePollDto): Promise<Poll> {
    const response = await apiClient.put<ApiResponse<Poll>>(
      `/polls/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/polls/${id}`);
  },

  async getResults(id: number): Promise<PollResults> {
    const response = await apiClient.get<ApiResponse<PollResults>>(
      `/polls/${id}/results`
    );
    return response.data.data;
  },
};
