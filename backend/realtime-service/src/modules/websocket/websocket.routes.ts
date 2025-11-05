import { Router, Request, Response, NextFunction } from 'express';
import pollsService from '../polls/polls.service';
import webSocketManager from './websocket.manager';
import logger from '../../shared/logger';

const router = Router();

// POST /api/notify/poll/:pollId
router.post(
  '/notify/poll/:pollId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pollId = parseInt(req.params.pollId, 10);

      if (isNaN(pollId)) {
        res.status(400).json({ success: false, error: 'Invalid poll ID' });
        return;
      }

      const results = await pollsService.getPollResults(pollId);

      webSocketManager.broadcastPollUpdate(pollId, results);

      const subscriberCount = webSocketManager.getSubscriberCount(pollId);
      logger.info(
        `Notified ${subscriberCount} subscribers about poll ${pollId} update`
      );

      res.status(200).json({
        success: true,
        pollId,
        subscriberCount,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
