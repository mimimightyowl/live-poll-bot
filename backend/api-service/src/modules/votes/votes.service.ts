import voteRepository from './votes.repository';
import { Vote, CreateVoteDto, UpdateVoteDto } from './votes.types';
import realtimeNotifier from '../../shared/realtime-notifier';
import logger from '../../shared/logger';

class VoteService {
  async getAllVotes(): Promise<Vote[]> {
    return voteRepository.findAll();
  }

  async getVoteById(id: number): Promise<Vote> {
    return voteRepository.findById(id);
  }

  async createVote(voteData: CreateVoteDto): Promise<Vote> {
    const vote = await voteRepository.create(voteData);

    try {
      const pollId = await voteRepository.getPollIdByOptionId(
        voteData.poll_option_id
      );
      await realtimeNotifier.notifyPollUpdate(pollId);
    } catch (error) {
      logger.warn('Failed to notify realtime service:', error as Error);
    }

    return vote;
  }

  async updateVote(id: number, voteData: UpdateVoteDto): Promise<Vote> {
    const vote = await voteRepository.update(id, voteData);

    if (voteData.poll_option_id) {
      try {
        const pollId = await voteRepository.getPollIdByOptionId(
          voteData.poll_option_id
        );
        await realtimeNotifier.notifyPollUpdate(pollId);
      } catch (error) {
        logger.warn('Failed to notify realtime service:', error as Error);
      }
    }

    return vote;
  }

  async deleteVote(id: number): Promise<void> {
    let pollId: number | null = null;
    try {
      const vote = await voteRepository.findById(id);
      pollId = await voteRepository.getPollIdByOptionId(vote.poll_option_id);
    } catch (error) {
      logger.warn(
        'Failed to get poll ID before vote deletion:',
        error as Error
      );
    }

    await voteRepository.delete(id);

    if (pollId) {
      try {
        await realtimeNotifier.notifyPollUpdate(pollId);
      } catch (error) {
        logger.warn('Failed to notify realtime service:', error as Error);
      }
    }
  }
}

export default new VoteService();
