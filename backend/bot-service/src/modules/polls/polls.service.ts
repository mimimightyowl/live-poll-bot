import pollsClient, {
  CreatePollRequest,
  GetPollRequest,
  GetUserPollsRequest,
  GetPollResultsRequest,
  PollResults,
} from './polls.client';
import logger from '../../shared/logger';

class PollsService {
  async createPoll(question: string, createdBy: number): Promise<number> {
    try {
      const request: CreatePollRequest = {
        question,
        created_by: createdBy,
      };

      const response = await pollsClient.createPoll(request);

      if (!response.success || !response.poll) {
        throw new Error('Failed to create poll');
      }

      return response.poll.id;
    } catch (error) {
      logger.error('Error in PollsService.createPoll:', error as Error);
      throw error;
    }
  }

  async getPoll(id: number) {
    try {
      const request: GetPollRequest = { id };
      const response = await pollsClient.getPoll(request);

      if (!response.success || !response.poll) {
        return null;
      }

      return response.poll;
    } catch (error) {
      logger.error('Error in PollsService.getPoll:', error as Error);
      return null;
    }
  }

  async getUserPolls(userId: number) {
    try {
      const request: GetUserPollsRequest = { user_id: userId };
      const response = await pollsClient.getUserPolls(request);

      if (!response.success || !response.polls) {
        return [];
      }

      return response.polls;
    } catch (error) {
      logger.error('Error in PollsService.getUserPolls:', error as Error);
      return [];
    }
  }

  async getPollResults(id: number): Promise<PollResults | null> {
    try {
      const request: GetPollResultsRequest = { id };
      const response = await pollsClient.getPollResults(request);

      if (!response.success || !response.results) {
        return null;
      }

      return response.results;
    } catch (error) {
      logger.error('Error in PollsService.getPollResults:', error as Error);
      return null;
    }
  }
}

export default new PollsService();
