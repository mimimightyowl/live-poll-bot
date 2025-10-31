import { Router, Request, Response, NextFunction } from 'express';
import pollService from './polls.service';
import {
  createPollSchema,
  updatePollSchema,
  paramsSchema,
  addPollOptionSchema,
  pollOptionParamsSchema,
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
      const id = Number(req.params.id);
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
      const id = Number(req.params.id);
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
      const id = Number(req.params.id);
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
      const id = Number(req.params.id);
      const results = await pollService.getPollResults(id);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/polls/:id/options
router.get(
  '/:id/options',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pollId = Number(req.params.id);
      const options = await pollService.getPollOptions(pollId);
      res.json({ success: true, data: options });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/polls/:id/options
router.post(
  '/:id/options',
  validate({ params: paramsSchema, body: addPollOptionSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pollId = Number(req.params.id);
      const { text } = req.body;
      const option = await pollService.addPollOption(pollId, text);
      res.status(201).json({ success: true, data: option });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/polls/:pollId/options/:optionId
router.delete(
  '/:pollId/options/:optionId',
  validate({ params: pollOptionParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pollId = Number(req.params.pollId);
      const optionId = Number(req.params.optionId);
      await pollService.deletePollOption(pollId, optionId);
      res.json({ success: true, message: 'Option deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
