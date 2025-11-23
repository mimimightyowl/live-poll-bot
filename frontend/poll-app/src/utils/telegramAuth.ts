/**
 * Telegram Authentication Utility
 *
 * Gets telegram_id from URL query parameters
 */

/**
 * Get telegram_id from URL query parameters
 * @returns telegram_id string or null if not found
 */
export function getTelegramIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const telegramId = urlParams.get('telegram_id');
  return telegramId;
}
