import { Router, Request, Response, NextFunction } from 'express';
import voteService from './votes.service';
import {
  createVoteSchema,
  updateVoteSchema,
  paramsSchema,
} from './votes.schema';
import validate from '../../shared/middlewares/validate';

const router = Router();

// GET /api/votes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const votes = await voteService.getAllVotes();
    res.json({ success: true, data: votes });
  } catch (err) {
    next(err);
  }
});

// GET /api/votes/:id
router.get(
  '/:id',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      const vote = await voteService.getVoteById(id);
      res.json({ success: true, data: vote });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/votes
router.post(
  '/',
  validate({ body: createVoteSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vote = await voteService.createVote(req.body);
      res.status(201).json({
        success: true,
        data: vote,
        message: 'Vote created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/votes/:id
router.put(
  '/:id',
  validate({ params: paramsSchema, body: updateVoteSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      const vote = await voteService.updateVote(id, req.body);
      res.json({
        success: true,
        data: vote,
        message: 'Vote updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/votes/:id
router.delete(
  '/:id',
  validate({ params: paramsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      await voteService.deleteVote(id);
      res.json({ success: true, message: 'Vote deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
