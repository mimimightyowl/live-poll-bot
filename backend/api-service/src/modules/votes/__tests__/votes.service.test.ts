import voteService from '../votes.service';
import voteRepository from '../votes.repository';
import realtimeNotifier from '../../../shared/realtime-notifier';
import logger from '../../../shared/logger';
import AppError from '../../../shared/errors/app-error';

// Mock dependencies
jest.mock('../votes.repository');
jest.mock('../../../shared/realtime-notifier');
jest.mock('../../../shared/logger');

describe('VoteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVote', () => {
    it('should create a vote and notify realtime service', async () => {
      const voteData = {
        poll_option_id: 1,
        user_id: 1,
      };

      const mockVote = {
        id: 1,
        poll_option_id: 1,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.create as jest.Mock).mockResolvedValue(mockVote);
      (voteRepository.getPollIdByOptionId as jest.Mock).mockResolvedValue(1);
      (realtimeNotifier.notifyPollUpdate as jest.Mock).mockResolvedValue(
        undefined
      );

      const vote = await voteService.createVote(voteData);

      expect(vote.id).toBeDefined();
      expect(vote.poll_option_id).toBe(1);
      expect(voteRepository.create).toHaveBeenCalledWith(voteData);
      expect(realtimeNotifier.notifyPollUpdate).toHaveBeenCalledWith(1);
    });

    it('should create vote even if realtime notification fails', async () => {
      const voteData = {
        poll_option_id: 1,
        user_id: 1,
      };

      const mockVote = {
        id: 1,
        poll_option_id: 1,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.create as jest.Mock).mockResolvedValue(mockVote);
      (voteRepository.getPollIdByOptionId as jest.Mock).mockResolvedValue(1);
      (realtimeNotifier.notifyPollUpdate as jest.Mock).mockRejectedValue(
        new Error('Notification failed')
      );

      const vote = await voteService.createVote(voteData);

      expect(vote.id).toBeDefined();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const voteData = {
        poll_option_id: 1,
        user_id: 1,
      };

      (voteRepository.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(voteService.createVote(voteData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getAllVotes', () => {
    it('should return all votes', async () => {
      const mockVotes = [
        {
          id: 1,
          poll_option_id: 1,
          user_id: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          poll_option_id: 2,
          user_id: 2,
          created_at: new Date(),
        },
      ];

      (voteRepository.findAll as jest.Mock).mockResolvedValue(mockVotes);

      const votes = await voteService.getAllVotes();

      expect(votes).toHaveLength(2);
      expect(voteRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getVoteById', () => {
    it('should return a vote by id', async () => {
      const mockVote = {
        id: 1,
        poll_option_id: 1,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.findById as jest.Mock).mockResolvedValue(mockVote);

      const vote = await voteService.getVoteById(1);

      expect(vote.id).toBe(1);
      expect(voteRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when vote not found', async () => {
      (voteRepository.findById as jest.Mock).mockRejectedValue(
        new AppError('Vote not found', 404)
      );

      await expect(voteService.getVoteById(999)).rejects.toThrow(
        'Vote not found'
      );
    });
  });

  describe('updateVote', () => {
    it('should update a vote and notify realtime service', async () => {
      const updateData = {
        poll_option_id: 2,
      };

      const mockUpdatedVote = {
        id: 1,
        poll_option_id: 2,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.update as jest.Mock).mockResolvedValue(mockUpdatedVote);
      (voteRepository.getPollIdByOptionId as jest.Mock).mockResolvedValue(1);
      (realtimeNotifier.notifyPollUpdate as jest.Mock).mockResolvedValue(
        undefined
      );

      const vote = await voteService.updateVote(1, updateData);

      expect(vote.poll_option_id).toBe(2);
      expect(voteRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(realtimeNotifier.notifyPollUpdate).toHaveBeenCalledWith(1);
    });

    it('should update vote without notification if poll_option_id not changed', async () => {
      const updateData = {
        user_id: 2,
      };

      const mockUpdatedVote = {
        id: 1,
        poll_option_id: 1,
        user_id: 2,
        created_at: new Date(),
      };

      (voteRepository.update as jest.Mock).mockResolvedValue(mockUpdatedVote);

      const vote = await voteService.updateVote(1, updateData);

      expect(vote.user_id).toBe(2);
      expect(realtimeNotifier.notifyPollUpdate).not.toHaveBeenCalled();
    });

    it('should handle notification errors gracefully', async () => {
      const updateData = {
        poll_option_id: 2,
      };

      const mockUpdatedVote = {
        id: 1,
        poll_option_id: 2,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.update as jest.Mock).mockResolvedValue(mockUpdatedVote);
      (voteRepository.getPollIdByOptionId as jest.Mock).mockResolvedValue(1);
      (realtimeNotifier.notifyPollUpdate as jest.Mock).mockRejectedValue(
        new Error('Notification failed')
      );

      const vote = await voteService.updateVote(1, updateData);

      expect(vote.poll_option_id).toBe(2);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('deleteVote', () => {
    it('should delete a vote and notify realtime service', async () => {
      const mockVote = {
        id: 1,
        poll_option_id: 1,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.findById as jest.Mock).mockResolvedValue(mockVote);
      (voteRepository.getPollIdByOptionId as jest.Mock).mockResolvedValue(1);
      (voteRepository.delete as jest.Mock).mockResolvedValue(undefined);
      (realtimeNotifier.notifyPollUpdate as jest.Mock).mockResolvedValue(
        undefined
      );

      await voteService.deleteVote(1);

      expect(voteRepository.delete).toHaveBeenCalledWith(1);
      expect(realtimeNotifier.notifyPollUpdate).toHaveBeenCalledWith(1);
    });

    it('should delete vote even if poll ID retrieval fails', async () => {
      (voteRepository.findById as jest.Mock).mockRejectedValue(
        new Error('Vote not found')
      );
      (voteRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await voteService.deleteVote(1);

      expect(voteRepository.delete).toHaveBeenCalledWith(1);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle notification errors gracefully', async () => {
      const mockVote = {
        id: 1,
        poll_option_id: 1,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.findById as jest.Mock).mockResolvedValue(mockVote);
      (voteRepository.getPollIdByOptionId as jest.Mock).mockResolvedValue(1);
      (voteRepository.delete as jest.Mock).mockResolvedValue(undefined);
      (realtimeNotifier.notifyPollUpdate as jest.Mock).mockRejectedValue(
        new Error('Notification failed')
      );

      await voteService.deleteVote(1);

      expect(voteRepository.delete).toHaveBeenCalledWith(1);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('hasUserVotedForPoll', () => {
    it('should return true if user has voted', async () => {
      const mockVote = {
        id: 1,
        poll_option_id: 1,
        user_id: 1,
        created_at: new Date(),
      };

      (voteRepository.findByUserIdAndPollId as jest.Mock).mockResolvedValue(
        mockVote
      );

      const hasVoted = await voteService.hasUserVotedForPoll(1, 1);

      expect(hasVoted).toBe(true);
      expect(voteRepository.findByUserIdAndPollId).toHaveBeenCalledWith(1, 1);
    });

    it('should return false if user has not voted', async () => {
      (voteRepository.findByUserIdAndPollId as jest.Mock).mockResolvedValue(
        null
      );

      const hasVoted = await voteService.hasUserVotedForPoll(1, 1);

      expect(hasVoted).toBe(false);
    });
  });
});
