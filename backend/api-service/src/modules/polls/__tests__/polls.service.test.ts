import pollService from '../polls.service';
import pollRepository from '../polls.repository';
import AppError from '../../../shared/errors/app-error';

// Mock the repository
jest.mock('../polls.repository');

describe('PollService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    it('should create a poll with valid data', async () => {
      const pollData = {
        question: 'Test question?',
        created_by: 1,
      };

      const mockPoll = {
        id: 1,
        question: 'Test question?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollRepository.create as jest.Mock).mockResolvedValue(mockPoll);

      const poll = await pollService.createPoll(pollData);

      expect(poll.question).toBe('Test question?');
      expect(poll.id).toBeDefined();
      expect(pollRepository.create).toHaveBeenCalledWith(pollData);
    });

    it('should reject empty question', async () => {
      const pollData = {
        question: '',
        created_by: 1,
      };

      (pollRepository.create as jest.Mock).mockRejectedValue(
        new AppError('Question cannot be empty', 400)
      );

      await expect(pollService.createPoll(pollData)).rejects.toThrow();
    });

    it('should handle repository errors', async () => {
      const pollData = {
        question: 'Test question?',
        created_by: 1,
      };

      (pollRepository.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(pollService.createPoll(pollData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getAllPolls', () => {
    it('should return all polls', async () => {
      const mockPolls = [
        {
          id: 1,
          question: 'Question 1?',
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          question: 'Question 2?',
          created_by: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (pollRepository.findAll as jest.Mock).mockResolvedValue(mockPolls);

      const polls = await pollService.getAllPolls();

      expect(polls).toHaveLength(2);
      expect(pollRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getPollById', () => {
    it('should return a poll by id', async () => {
      const mockPoll = {
        id: 1,
        question: 'Test question?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollRepository.findById as jest.Mock).mockResolvedValue(mockPoll);

      const poll = await pollService.getPollById(1);

      expect(poll.id).toBe(1);
      expect(pollRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when poll not found', async () => {
      (pollRepository.findById as jest.Mock).mockRejectedValue(
        new AppError('Poll not found', 404)
      );

      await expect(pollService.getPollById(999)).rejects.toThrow(
        'Poll not found'
      );
    });
  });

  describe('updatePoll', () => {
    it('should update a poll', async () => {
      const updateData = {
        question: 'Updated question?',
      };

      const mockUpdatedPoll = {
        id: 1,
        question: 'Updated question?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollRepository.update as jest.Mock).mockResolvedValue(mockUpdatedPoll);

      const poll = await pollService.updatePoll(1, updateData);

      expect(poll.question).toBe('Updated question?');
      expect(pollRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw error when poll not found', async () => {
      const updateData = {
        question: 'Updated question?',
      };

      (pollRepository.update as jest.Mock).mockRejectedValue(
        new AppError('Poll not found', 404)
      );

      await expect(pollService.updatePoll(999, updateData)).rejects.toThrow(
        'Poll not found'
      );
    });
  });

  describe('deletePoll', () => {
    it('should delete a poll', async () => {
      (pollRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await pollService.deletePoll(1);

      expect(pollRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error when poll not found', async () => {
      (pollRepository.delete as jest.Mock).mockRejectedValue(
        new AppError('Poll not found', 404)
      );

      await expect(pollService.deletePoll(999)).rejects.toThrow(
        'Poll not found'
      );
    });
  });

  describe('getPollResults', () => {
    it('should return poll results with vote counts', async () => {
      const mockResults = {
        id: 1,
        question: 'Test question?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
        options: [
          { id: 1, text: 'Option 1', vote_count: 5 },
          { id: 2, text: 'Option 2', vote_count: 3 },
        ],
        total_votes: 8,
      };

      (pollRepository.getPollResults as jest.Mock).mockResolvedValue(
        mockResults
      );

      const results = await pollService.getPollResults(1);

      expect(results.total_votes).toBe(8);
      expect(results.options).toHaveLength(2);
      expect(pollRepository.getPollResults).toHaveBeenCalledWith(1);
    });
  });

  describe('getPollOptions', () => {
    it('should return poll options', async () => {
      const mockOptions = [
        { id: 1, poll_id: 1, text: 'Option 1' },
        { id: 2, poll_id: 1, text: 'Option 2' },
      ];

      (pollRepository.getPollOptions as jest.Mock).mockResolvedValue(
        mockOptions
      );

      const options = await pollService.getPollOptions(1);

      expect(options).toHaveLength(2);
      expect(pollRepository.getPollOptions).toHaveBeenCalledWith(1);
    });
  });

  describe('addPollOption', () => {
    it('should add a poll option', async () => {
      const mockOption = {
        id: 1,
        poll_id: 1,
        text: 'New Option',
      };

      (pollRepository.addPollOption as jest.Mock).mockResolvedValue(mockOption);

      const option = await pollService.addPollOption(1, 'New Option');

      expect(option.text).toBe('New Option');
      expect(pollRepository.addPollOption).toHaveBeenCalledWith(
        1,
        'New Option'
      );
    });
  });

  describe('deletePollOption', () => {
    it('should delete a poll option', async () => {
      (pollRepository.deletePollOption as jest.Mock).mockResolvedValue(
        undefined
      );

      await pollService.deletePollOption(1, 1);

      expect(pollRepository.deletePollOption).toHaveBeenCalledWith(1, 1);
    });

    it('should throw error when option not found', async () => {
      (pollRepository.deletePollOption as jest.Mock).mockRejectedValue(
        new AppError('Poll option not found', 404)
      );

      await expect(pollService.deletePollOption(1, 999)).rejects.toThrow(
        'Poll option not found'
      );
    });
  });
});
