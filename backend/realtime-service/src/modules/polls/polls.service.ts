import pollsRepository from './polls.repository';
import { PollResults } from './polls.types';
import AppError from '../../shared/errors/app-error';

class PollsService {
  async getPollResults(id: number): Promise<PollResults> {
    const results = await pollsRepository.getPollResults(id);

    if (!results) {
      throw new AppError('Poll not found', 404);
    }

    return results;
  }
}

export default new PollsService();
