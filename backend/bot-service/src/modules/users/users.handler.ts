import { Context } from 'telegraf';
import usersService from './users.service';
import logger from '../../shared/logger';

class UsersHandler {
  async ensureUser(ctx: Context): Promise<number | null> {
    try {
      const telegramId = ctx.from?.id.toString();
      const username = ctx.from?.username || `user_${ctx.from?.id}`;
      const fullName = ctx.from?.first_name
        ? `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim()
        : undefined;

      if (!telegramId) {
        await ctx.reply('Не удалось определить ваш Telegram ID.');
        return null;
      }

      const user = await usersService.getOrCreateUser(
        telegramId,
        username,
        fullName
      );
      return user.id;
    } catch (error) {
      logger.error('Error in UsersHandler.ensureUser:', error as Error);
      await ctx.reply('Произошла ошибка при регистрации. Попробуйте позже.');
      return null;
    }
  }
}

export default new UsersHandler();
