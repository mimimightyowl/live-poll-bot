import { Telegraf } from 'telegraf';
import { env } from './config';
import logger from './shared/logger';
import usersHandler from './modules/users/users.handler';
import pollsHandler from './modules/polls/polls.handler';

let bot: Telegraf | null = null;

export async function startBot(): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  // Basic error handling
  bot.catch((err, ctx) => {
    logger.error(`Error in bot handler:`, err);
    ctx.reply('Произошла ошибка. Попробуйте позже.');
  });

  // Start command handler
  bot.start(async ctx => {
    try {
      logger.info(`/start command received from user ${ctx.from?.id}`);
      const userId = await usersHandler.ensureUser(ctx);
      if (userId) {
        await ctx.reply(
          '👋 Добро пожаловать в Live Poll Bot!\n\n' +
            'Создавайте интерактивные опросы и делитесь ссылками для голосования.\n\n' +
            'Используйте /help для списка команд.'
        );
        logger.info(
          `User ${ctx.from?.id} registered/authenticated with userId ${userId}`
        );
      } else {
        logger.warn(`Failed to register user ${ctx.from?.id}`);
      }
    } catch (error) {
      logger.error(
        `Error in /start command for user ${ctx.from?.id}:`,
        error as Error
      );
      await ctx.reply(
        '❌ Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз через несколько секунд.'
      );
    }
  });

  // Help command handler
  bot.help(ctx => {
    ctx.reply(
      '📋 Доступные команды:\n\n' +
        '🆕 Создание опроса:\n' +
        '/createpoll "Вопрос" - Создать опрос\n' +
        '/addoption <id> "текст" - Добавить вариант\n' +
        '/finish <id> - Завершить создание\n\n' +
        '📊 Управление:\n' +
        '/mypolls - Список опросов\n' +
        '/poll <id> - Информация об опросе\n\n' +
        '💡 Пример использования:\n' +
        '1. /createpoll "Какой язык лучше?"\n' +
        '2. /addoption 1 "Python"\n' +
        '3. /addoption 1 "JavaScript"\n' +
        '4. /finish 1\n\n' +
        '✨ После завершения получите ссылку для голосования!'
    );
  });

  // Create poll command handler
  bot.command('createpoll', async ctx => {
    const userId = await usersHandler.ensureUser(ctx);
    if (userId) {
      await pollsHandler.handleCreatePoll(ctx, userId);
    }
  });

  // My polls command handler
  bot.command('mypolls', async ctx => {
    const userId = await usersHandler.ensureUser(ctx);
    if (userId) {
      await pollsHandler.handleMyPolls(ctx, userId);
    }
  });

  // Get poll command handler
  bot.command('poll', async ctx => {
    const userId = await usersHandler.ensureUser(ctx);
    if (!userId) {
      return;
    }

    const text = (ctx.message as any)?.text || '';
    const match = text.match(/^\/poll\s+(\d+)$/);

    if (!match) {
      await ctx.reply('Использование: /poll <id>\n\nПример: /poll 1');
      return;
    }

    const pollId = parseInt(match[1], 10);
    if (isNaN(pollId)) {
      await ctx.reply('Неверный ID опроса. Используйте число.');
      return;
    }

    await pollsHandler.handleGetPoll(ctx, pollId);
  });

  // Add option command handler
  bot.command('addoption', async ctx => {
    const userId = await usersHandler.ensureUser(ctx);
    if (userId) {
      await pollsHandler.handleAddOption(ctx, userId);
    }
  });

  // Finish poll command handler
  bot.command('finish', async ctx => {
    const userId = await usersHandler.ensureUser(ctx);
    if (userId) {
      await pollsHandler.handleFinishPoll(ctx, userId);
    }
  });

  await bot.launch();
  logger.info('Telegram bot launched successfully');
}

export async function stopBot(): Promise<void> {
  if (bot) {
    bot.stop();
    logger.info('Telegram bot stopped');
  }
}

// Graceful shutdown
process.once('SIGINT', () => stopBot());
process.once('SIGTERM', () => stopBot());
