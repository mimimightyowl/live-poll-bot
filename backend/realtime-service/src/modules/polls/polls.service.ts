import apiServiceClient from '../../grpc-clients/api-service.client';
import { PollResults } from './polls.types';
import AppError from '../../shared/errors/app-error';

class PollsService {
  async getPollResults(id: number): Promise<PollResults> {
    const results = await apiServiceClient.getPollResults(id);

    if (!results) {
      throw new AppError('Poll not found', 404);
    }

    // Convert string dates to Date objects for compatibility
    return {
      ...results,
      created_at: new Date(results.created_at),
      updated_at: new Date(results.updated_at),
    };
  }
}

export default new PollsService();
