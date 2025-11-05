import { env } from '../config';
import logger from './logger';

interface NotifyPollResponse {
  success: boolean;
  pollId: number;
  subscriberCount: number;
}

class RealtimeNotifier {
  async notifyPollUpdate(pollId: number): Promise<void> {
    try {
      const url = `${env.REALTIME_SERVICE_URL}/api/notify/poll/${pollId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        logger.warn(
          `Failed to notify realtime service for poll ${pollId}: ${response.status}`
        );
        return;
      }

      const data = (await response.json()) as NotifyPollResponse;

      logger.debug(
        `Notified realtime service for poll ${pollId}, ${data.subscriberCount} subscribers`
      );
    } catch (error) {
      // Don't throw error - notification failure shouldn't affect vote creation
      logger.warn(
        `Error notifying realtime service for poll ${pollId}:`,
        error as Error
      );
    }
  }
}

export default new RealtimeNotifier();
