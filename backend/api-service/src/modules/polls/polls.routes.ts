import { Router, Request, Response, NextFunction } from 'express';
import pollService from './polls.service';
import {
  createPollSchema,
  updatePollSchema,
  paramsSchema,
} from './polls.schema';
import validate from '../../shared/middlewares/validate';

const router = Router();

// GET /api/polls
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const polls = await pollService.getAllPolls();
    res.json({ success: true, data: polls });
  } catch (err) {
    next(err);
  }
});

// GET /api/polls/:id
router.get(
  '/:id',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      const poll = await pollService.getPollById(id);
      res.json({ success: true, data: poll });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/polls
router.post(
  '/',
  validate({ body: createPollSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const poll = await pollService.createPoll(req.body);
      res.status(201).json({
        success: true,
        data: poll,
        message: 'Poll created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/polls/:id
router.put(
  '/:id',
  validate({ params: paramsSchema, body: updatePollSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      const poll = await pollService.updatePoll(id, req.body);
      res.json({
        success: true,
        data: poll,
        message: 'Poll updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/polls/:id
router.delete(
  '/:id',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      await pollService.deletePoll(id);
      res.json({ success: true, message: 'Poll deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/polls/:id/results
router.get(
  '/:id/results',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      const results = await pollService.getPollResults(id);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
