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
    const userId = await usersHandler.ensureUser(ctx);
    if (userId) {
      await ctx.reply(
        '👋 Добро пожаловать в Live Poll Bot!\n\n' +
          'Создавайте интерактивные опросы и делитесь ссылками для голосования.\n\n' +
          'Используйте /help для списка команд.'
      );
    }
  });

  // Help command handler
  bot.help(ctx => {
    ctx.reply(
      '📋 Доступные команды:\n\n' +
        '/start - Начать работу с ботом\n' +
        '/createpoll "Вопрос" - Создать новый опрос\n' +
        '/mypolls - Список ваших опросов\n' +
        '/poll <id> - Информация об опросе\n' +
        '/help - Показать эту справку\n\n' +
        'Пример:\n' +
        '/createpoll "Какой язык программирования лучше?"'
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
