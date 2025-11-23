import { Context } from 'telegraf';
import pollsHandler from '../polls.handler';
import pollsService from '../polls.service';
import logger from '../../../shared/logger';

// Mock dependencies
jest.mock('../polls.service');
jest.mock('../../../shared/logger');
jest.mock('../../../config', () => ({
  env: {
    FRONTEND_URL: 'http://localhost:3000',
  },
}));

describe('PollsHandler', () => {
  let mockCtx: Partial<Context>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      reply: jest.fn().mockResolvedValue(undefined),
      from: {
        id: 123456789,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
      },
      message: {
        text: '',
      },
    };
  });

  describe('handleCreatePoll', () => {
    it('should create a poll with valid command', async () => {
      (mockCtx.message as any).text =
        '/createpoll "What is your favorite language?"';
      (pollsService.createPoll as jest.Mock).mockResolvedValue(1);

      await pollsHandler.handleCreatePoll(mockCtx as Context, 1);

      expect(pollsService.createPoll).toHaveBeenCalledWith(
        'What is your favorite language?',
        1
      );
      expect(mockCtx.reply).toHaveBeenCalled();
    });

    it('should reject invalid command format', async () => {
      (mockCtx.message as any).text = '/createpoll invalid format';

      await pollsHandler.handleCreatePoll(mockCtx as Context, 1);

      expect(pollsService.createPoll).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Использование')
      );
    });

    it('should reject question that is too short', async () => {
      (mockCtx.message as any).text = '/createpoll "ab"';

      await pollsHandler.handleCreatePoll(mockCtx as Context, 1);

      expect(pollsService.createPoll).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('минимум 3 символа')
      );
    });

    it('should reject question that is too long', async () => {
      const longQuestion = 'a'.repeat(501);
      (mockCtx.message as any).text = `/createpoll "${longQuestion}"`;

      await pollsHandler.handleCreatePoll(mockCtx as Context, 1);

      expect(pollsService.createPoll).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('слишком длинный')
      );
    });

    it('should handle service errors gracefully', async () => {
      (mockCtx.message as any).text = '/createpoll "Test question?"';
      (pollsService.createPoll as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      await pollsHandler.handleCreatePoll(mockCtx as Context, 1);

      expect(logger.error).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('ошибка')
      );
    });
  });

  describe('handleMyPolls', () => {
    it('should display user polls', async () => {
      const mockPolls = [
        {
          id: 1,
          question: 'Question 1?',
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (pollsService.getUserPolls as jest.Mock).mockResolvedValue(mockPolls);
      (pollsService.getPollOptions as jest.Mock).mockResolvedValue([
        { id: 1, poll_id: 1, text: 'Option 1' },
      ]);

      await pollsHandler.handleMyPolls(mockCtx as Context, 1);

      expect(pollsService.getUserPolls).toHaveBeenCalledWith(1);
      expect(mockCtx.reply).toHaveBeenCalled();
    });

    it('should show message when user has no polls', async () => {
      (pollsService.getUserPolls as jest.Mock).mockResolvedValue([]);

      await pollsHandler.handleMyPolls(mockCtx as Context, 1);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('нет созданных опросов')
      );
    });

    it('should handle errors gracefully', async () => {
      (pollsService.getUserPolls as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      await pollsHandler.handleMyPolls(mockCtx as Context, 1);

      expect(logger.error).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('ошибка')
      );
    });
  });

  describe('handleGetPoll', () => {
    it('should display poll information', async () => {
      const mockPoll = {
        id: 1,
        question: 'Test question?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockResults = {
        id: 1,
        question: 'Test question?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
        options: [{ id: 1, text: 'Option 1', vote_count: 5 }],
        total_votes: 5,
      };

      (pollsService.getPoll as jest.Mock).mockResolvedValue(mockPoll);
      (pollsService.getPollResults as jest.Mock).mockResolvedValue(mockResults);

      await pollsHandler.handleGetPoll(mockCtx as Context, 1);

      expect(pollsService.getPoll).toHaveBeenCalledWith(1);
      expect(mockCtx.reply).toHaveBeenCalled();
    });

    it('should show message when poll not found', async () => {
      (pollsService.getPoll as jest.Mock).mockResolvedValue(null);

      await pollsHandler.handleGetPoll(mockCtx as Context, 999);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('не найден')
      );
    });

    it('should handle errors gracefully', async () => {
      (pollsService.getPoll as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      await pollsHandler.handleGetPoll(mockCtx as Context, 1);

      expect(logger.error).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('ошибка')
      );
    });
  });

  describe('handleAddOption', () => {
    it('should add option to poll', async () => {
      (mockCtx.message as any).text = '/addoption 1 "New Option"';

      const mockPoll = {
        id: 1,
        question: 'Test?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollsService.getPoll as jest.Mock).mockResolvedValue(mockPoll);
      (pollsService.getPollOptions as jest.Mock).mockResolvedValue([]);
      (pollsService.addPollOption as jest.Mock).mockResolvedValue(undefined);

      await pollsHandler.handleAddOption(mockCtx as Context, 1);

      expect(pollsService.addPollOption).toHaveBeenCalledWith(1, 'New Option');
      expect(mockCtx.reply).toHaveBeenCalled();
    });

    it('should reject invalid command format', async () => {
      (mockCtx.message as any).text = '/addoption invalid';

      await pollsHandler.handleAddOption(mockCtx as Context, 1);

      expect(pollsService.addPollOption).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Использование')
      );
    });

    it('should reject when poll does not belong to user', async () => {
      (mockCtx.message as any).text = '/addoption 1 "Option"';

      const mockPoll = {
        id: 1,
        question: 'Test?',
        created_by: 2, // Different user
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollsService.getPoll as jest.Mock).mockResolvedValue(mockPoll);

      await pollsHandler.handleAddOption(mockCtx as Context, 1);

      expect(pollsService.addPollOption).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('только к своим опросам')
      );
    });

    it('should reject when option limit reached', async () => {
      (mockCtx.message as any).text = '/addoption 1 "Option"';

      const mockPoll = {
        id: 1,
        question: 'Test?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockOptions = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          poll_id: 1,
          text: `Option ${i + 1}`,
        }));

      (pollsService.getPoll as jest.Mock).mockResolvedValue(mockPoll);
      (pollsService.getPollOptions as jest.Mock).mockResolvedValue(mockOptions);

      await pollsHandler.handleAddOption(mockCtx as Context, 1);

      expect(pollsService.addPollOption).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Максимум 10 вариантов')
      );
    });
  });

  describe('handleFinishPoll', () => {
    it('should finish poll creation', async () => {
      (mockCtx.message as any).text = '/finish 1';

      const mockPoll = {
        id: 1,
        question: 'Test?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollsService.getPoll as jest.Mock).mockResolvedValue(mockPoll);
      (pollsService.getPollOptions as jest.Mock).mockResolvedValue([
        { id: 1, poll_id: 1, text: 'Option 1' },
      ]);

      await pollsHandler.handleFinishPoll(mockCtx as Context, 1);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('готов к использованию')
      );
    });

    it('should reject invalid command format', async () => {
      (mockCtx.message as any).text = '/finish invalid';

      await pollsHandler.handleFinishPoll(mockCtx as Context, 1);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Использование')
      );
    });

    it('should reject when poll has no options', async () => {
      (mockCtx.message as any).text = '/finish 1';

      const mockPoll = {
        id: 1,
        question: 'Test?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pollsService.getPoll as jest.Mock).mockResolvedValue(mockPoll);
      (pollsService.getPollOptions as jest.Mock).mockResolvedValue([]);

      await pollsHandler.handleFinishPoll(mockCtx as Context, 1);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('хотя бы один вариант')
      );
    });

    it('should handle errors gracefully', async () => {
      (mockCtx.message as any).text = '/finish 1';
      (pollsService.getPoll as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      await pollsHandler.handleFinishPoll(mockCtx as Context, 1);

      expect(logger.error).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('ошибка')
      );
    });
  });
});
