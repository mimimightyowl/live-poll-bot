import { Context } from 'telegraf';
import pollsService from './polls.service';
import { env } from '../../config';
import logger from '../../shared/logger';

class PollsHandler {
  async handleCreatePoll(ctx: Context, userId: number): Promise<void> {
    try {
      const text = (ctx.message as any)?.text || '';
      const match = text.match(/^\/createpoll\s+"(.+)"$/);

      if (!match) {
        await ctx.reply(
          'Использование: /createpoll "Ваш вопрос здесь"\n\n' +
            'Пример: /createpoll "Какой язык программирования лучше?"'
        );
        return;
      }

      const question = match[1].trim();

      if (question.length < 3) {
        await ctx.reply('Вопрос должен содержать минимум 3 символа.');
        return;
      }

      if (question.length > 500) {
        await ctx.reply('Вопрос слишком длинный. Максимум 500 символов.');
        return;
      }

      const pollId = await pollsService.createPoll(question, userId);
      const pollUrl = `${env.FRONTEND_URL}/poll/${pollId}/vote`;

      await ctx.reply(
        `✅ Опрос создан!\n\n` +
          `📊 Вопрос: ${question}\n\n` +
          `🔗 Ссылка для голосования:\n${pollUrl}\n\n` +
          `Поделитесь этой ссылкой с участниками опроса. Результаты будут обновляться в реальном времени!`
      );
    } catch (error) {
      logger.error('Error in PollsHandler.handleCreatePoll:', error as Error);
      await ctx.reply(
        'Произошла ошибка при создании опроса. Попробуйте позже.'
      );
    }
  }

  async handleMyPolls(ctx: Context, userId: number): Promise<void> {
    try {
      const polls = await pollsService.getUserPolls(userId);

      if (polls.length === 0) {
        await ctx.reply(
          'У вас пока нет созданных опросов.\n\nИспользуйте /createpoll для создания нового опроса.'
        );
        return;
      }

      let message = `📊 Ваши опросы (${polls.length}):\n\n`;

      polls.forEach((poll, index) => {
        const pollUrl = `${env.FRONTEND_URL}/poll/${poll.id}/vote`;
        message += `${index + 1}. ${poll.question}\n`;
        message += `   🔗 ${pollUrl}\n\n`;
      });

      await ctx.reply(message);
    } catch (error) {
      logger.error('Error in PollsHandler.handleMyPolls:', error as Error);
      await ctx.reply(
        'Произошла ошибка при получении списка опросов. Попробуйте позже.'
      );
    }
  }

  async handleGetPoll(ctx: Context, pollId: number): Promise<void> {
    try {
      const poll = await pollsService.getPoll(pollId);

      if (!poll) {
        await ctx.reply(`Опрос с ID ${pollId} не найден.`);
        return;
      }

      const pollUrl = `${env.FRONTEND_URL}/poll/${poll.id}/vote`;
      const results = await pollsService.getPollResults(pollId);

      let message = `📊 Опрос #${poll.id}\n\n`;
      message += `❓ Вопрос: ${poll.question}\n\n`;
      message += `🔗 Ссылка для голосования:\n${pollUrl}\n\n`;

      if (results && results.options.length > 0) {
        message += `📈 Текущие результаты:\n`;
        results.options.forEach(option => {
          const percentage =
            results.total_votes > 0
              ? Math.round((option.vote_count / results.total_votes) * 100)
              : 0;
          message += `  • ${option.text}: ${option.vote_count} (${percentage}%)\n`;
        });
        message += `\nВсего голосов: ${results.total_votes}`;
      } else {
        message += `Пока нет голосов.`;
      }

      await ctx.reply(message);
    } catch (error) {
      logger.error('Error in PollsHandler.handleGetPoll:', error as Error);
      await ctx.reply(
        'Произошла ошибка при получении информации об опросе. Попробуйте позже.'
      );
    }
  }
}

export default new PollsHandler();
