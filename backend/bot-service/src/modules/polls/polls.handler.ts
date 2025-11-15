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

      await ctx.reply(
        `✅ Опрос создан! ID: ${pollId}\n\n` +
          `📊 Вопрос: ${question}\n\n` +
          `📝 Следующий шаг: Добавьте варианты ответа\n` +
          `Используйте: /addoption ${pollId} "Ваш вариант"\n\n` +
          `Пример:\n` +
          `/addoption ${pollId} "Python"\n` +
          `/addoption ${pollId} "JavaScript"\n\n` +
          `Когда закончите добавлять варианты, используйте:\n` +
          `/finish ${pollId}`
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

      for (let index = 0; index < polls.length; index++) {
        const poll = polls[index];
        const options = await pollsService.getPollOptions(poll.id);
        const pollUrl = `${env.FRONTEND_URL}/poll/${poll.id}/vote`;

        message += `${index + 1}. ${poll.question}\n`;
        message += `   ID: ${poll.id} | Вариантов: ${options.length}\n`;

        if (options.length === 0) {
          message += `   ⚠️ Нужно добавить варианты: /addoption ${poll.id} "текст"\n`;
        } else {
          message += `   🔗 ${pollUrl}\n`;
        }
        message += '\n';
      }

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

      if (results && results.options.length > 0) {
        message += `📝 Варианты ответа:\n`;
        results.options.forEach(option => {
          const percentage =
            results.total_votes > 0
              ? Math.round((option.vote_count / results.total_votes) * 100)
              : 0;
          message += `  • ${option.text}: ${option.vote_count} голосов (${percentage}%)\n`;
        });
        message += `\nВсего голосов: ${results.total_votes}\n\n`;
        message += `🔗 Ссылка для голосования:\n${pollUrl}`;
      } else {
        message += `⚠️ В опросе нет вариантов ответа.\n\n`;
        message += `Добавьте варианты: /addoption ${pollId} "текст"`;
      }

      await ctx.reply(message);
    } catch (error) {
      logger.error('Error in PollsHandler.handleGetPoll:', error as Error);
      await ctx.reply(
        'Произошла ошибка при получении информации об опросе. Попробуйте позже.'
      );
    }
  }

  async handleAddOption(ctx: Context, userId: number): Promise<void> {
    try {
      const text = (ctx.message as any)?.text || '';
      const match = text.match(/^\/addoption\s+(\d+)\s+"(.+)"$/);

      if (!match) {
        await ctx.reply(
          'Использование: /addoption <poll_id> "текст"\n\n' +
            'Пример: /addoption 123 "Python"'
        );
        return;
      }

      const pollId = parseInt(match[1], 10);
      const optionText = match[2].trim();

      // Validate poll exists and belongs to user
      const poll = await pollsService.getPoll(pollId);
      if (!poll) {
        await ctx.reply(`❌ Опрос ${pollId} не найден.`);
        return;
      }
      if (poll.created_by !== userId) {
        await ctx.reply(
          '❌ Вы можете добавлять варианты только к своим опросам.'
        );
        return;
      }

      // Validate option text length
      if (optionText.length < 1 || optionText.length > 200) {
        await ctx.reply('❌ Текст варианта: 1-200 символов.');
        return;
      }

      // Check limit (max 10 options)
      const options = await pollsService.getPollOptions(pollId);
      if (options.length >= 10) {
        await ctx.reply('❌ Максимум 10 вариантов ответа.');
        return;
      }

      await pollsService.addPollOption(pollId, optionText);
      await ctx.reply(
        `✅ Вариант "${optionText}" добавлен\n` +
          `Текущее количество: ${options.length + 1}\n\n` +
          `Добавьте еще или завершите: /finish ${pollId}`
      );
    } catch (error) {
      logger.error('Error in PollsHandler.handleAddOption:', error as Error);
      await ctx.reply('Произошла ошибка при добавлении варианта.');
    }
  }

  async handleFinishPoll(ctx: Context, userId: number): Promise<void> {
    try {
      const text = (ctx.message as any)?.text || '';
      const match = text.match(/^\/finish\s+(\d+)$/);

      if (!match) {
        await ctx.reply(
          'Использование: /finish <poll_id>\n\nПример: /finish 123'
        );
        return;
      }

      const pollId = parseInt(match[1], 10);

      // Validate poll exists and belongs to user
      const poll = await pollsService.getPoll(pollId);
      if (!poll) {
        await ctx.reply(`❌ Опрос ${pollId} не найден.`);
        return;
      }
      if (poll.created_by !== userId) {
        await ctx.reply('❌ Вы можете завершать только свои опросы.');
        return;
      }

      // Check if poll has options
      const options = await pollsService.getPollOptions(pollId);
      if (options.length === 0) {
        await ctx.reply(
          `❌ Опрос должен иметь хотя бы один вариант ответа.\n\n` +
            `Добавьте варианты: /addoption ${pollId} "Ваш вариант"`
        );
        return;
      }

      const pollUrl = `${env.FRONTEND_URL}/poll/${poll.id}/vote`;
      await ctx.reply(
        `🎉 Опрос готов к использованию!\n\n` +
          `📊 Вопрос: ${poll.question}\n` +
          `📝 Вариантов ответа: ${options.length}\n\n` +
          `🔗 Ссылка для голосования:\n${pollUrl}\n\n` +
          `Поделитесь этой ссылкой с участниками опроса. Результаты будут обновляться в реальном времени!`
      );
    } catch (error) {
      logger.error('Error in PollsHandler.handleFinishPoll:', error as Error);
      await ctx.reply('Произошла ошибка при завершении создания опроса.');
    }
  }
}

export default new PollsHandler();
