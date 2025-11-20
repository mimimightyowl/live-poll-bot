import { Router, Request, Response, NextFunction } from 'express';
import voteService from './votes.service';
import {
  createVoteSchema,
  updateVoteSchema,
  paramsSchema,
} from './votes.schema';
import validate from '../../shared/middlewares/validate';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Vote:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Vote ID
 *           example: 1
 *         poll_option_id:
 *           type: integer
 *           description: ID of the poll option being voted for
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID of the user who cast the vote
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     CreateVoteRequest:
 *       type: object
 *       required:
 *         - poll_option_id
 *         - user_id
 *       properties:
 *         poll_option_id:
 *           type: integer
 *           description: ID of the poll option being voted for
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID of the user casting the vote
 *           example: 1
 *     UpdateVoteRequest:
 *       type: object
 *       properties:
 *         poll_option_id:
 *           type: integer
 *           description: ID of the poll option being voted for
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID of the user who cast the vote
 *           example: 1
 */

/**
 * @swagger
 * /api/votes:
 *   get:
 *     summary: Get all votes
 *     tags: [Votes]
 *     responses:
 *       200:
 *         description: List of all votes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vote'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   poll_option_id: 1
 *                   user_id: 1
 *                   created_at: "2024-01-15T10:30:00Z"
 *                 - id: 2
 *                   poll_option_id: 2
 *                   user_id: 2
 *                   created_at: "2024-01-15T10:31:00Z"
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const votes = await voteService.getAllVotes();
    res.json({ success: true, data: votes });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/votes/{id}:
 *   get:
 *     summary: Get a vote by ID
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vote ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Vote details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Vote'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 poll_option_id: 1
 *                 user_id: 1
 *                 created_at: "2024-01-15T10:30:00Z"
 *       404:
 *         description: Vote not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/votes:
 *   post:
 *     summary: Create a new vote
 *     tags: [Votes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVoteRequest'
 *           example:
 *             poll_option_id: 1
 *             user_id: 1
 *     responses:
 *       201:
 *         description: Vote created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Vote'
 *                 message:
 *                   type: string
 *                   example: "Vote created successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 poll_option_id: 1
 *                 user_id: 1
 *                 created_at: "2024-01-15T10:30:00Z"
 *               message: "Vote created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/votes/{id}:
 *   put:
 *     summary: Update a vote
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vote ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVoteRequest'
 *           example:
 *             poll_option_id: 2
 *     responses:
 *       200:
 *         description: Vote updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Vote'
 *                 message:
 *                   type: string
 *                   example: "Vote updated successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 poll_option_id: 2
 *                 user_id: 1
 *                 created_at: "2024-01-15T10:30:00Z"
 *               message: "Vote updated successfully"
 *       404:
 *         description: Vote not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/votes/{id}:
 *   delete:
 *     summary: Delete a vote
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vote ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Vote deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Vote deleted successfully"
 *             example:
 *               success: true
 *               message: "Vote deleted successfully"
 *       404:
 *         description: Vote not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
