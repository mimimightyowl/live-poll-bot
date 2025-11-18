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

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Poll ID
 *           example: 1
 *         question:
 *           type: string
 *           description: Poll question
 *           example: "What is your favorite programming language?"
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the poll
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     PollOption:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Option ID
 *           example: 1
 *         poll_id:
 *           type: integer
 *           description: ID of the poll this option belongs to
 *           example: 1
 *         text:
 *           type: string
 *           description: Option text
 *           example: "JavaScript"
 *     PollOptionResult:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Option ID
 *           example: 1
 *         text:
 *           type: string
 *           description: Option text
 *           example: "JavaScript"
 *         vote_count:
 *           type: integer
 *           description: Number of votes for this option
 *           example: 42
 *     PollResults:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Poll ID
 *           example: 1
 *         question:
 *           type: string
 *           description: Poll question
 *           example: "What is your favorite programming language?"
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the poll
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PollOptionResult'
 *         total_votes:
 *           type: integer
 *           description: Total number of votes across all options
 *           example: 100
 *     CreatePollRequest:
 *       type: object
 *       required:
 *         - question
 *         - created_by
 *       properties:
 *         question:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Poll question
 *           example: "What is your favorite programming language?"
 *         created_by:
 *           type: integer
 *           description: ID of the user creating the poll
 *           example: 1
 *     UpdatePollRequest:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Poll question
 *           example: "What is your favorite programming language?"
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the poll
 *           example: 1
 *     AddPollOptionRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Option text
 *           example: "JavaScript"
 */

/**
 * @swagger
 * /api/polls:
 *   get:
 *     summary: Get all polls
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: List of all polls
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
 *                     $ref: '#/components/schemas/Poll'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   question: "What is your favorite programming language?"
 *                   created_by: 1
 *                   created_at: "2024-01-15T10:30:00Z"
 *                   updated_at: "2024-01-15T10:30:00Z"
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const polls = await pollService.getAllPolls();
    res.json({ success: true, data: polls });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/polls/{id}:
 *   get:
 *     summary: Get a poll by ID
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Poll details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Poll'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 question: "What is your favorite programming language?"
 *                 created_by: 1
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-15T10:30:00Z"
 *       404:
 *         description: Poll not found
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
      const id = Number(req.params.id);
      const poll = await pollService.getPollById(id);
      res.json({ success: true, data: poll });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/polls:
 *   post:
 *     summary: Create a new poll
 *     tags: [Polls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePollRequest'
 *           example:
 *             question: "What is your favorite programming language?"
 *             created_by: 1
 *     responses:
 *       201:
 *         description: Poll created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Poll'
 *                 message:
 *                   type: string
 *                   example: "Poll created successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 question: "What is your favorite programming language?"
 *                 created_by: 1
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-15T10:30:00Z"
 *               message: "Poll created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/polls/{id}:
 *   put:
 *     summary: Update a poll
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePollRequest'
 *           example:
 *             question: "What is your favorite programming language? (Updated)"
 *     responses:
 *       200:
 *         description: Poll updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Poll'
 *                 message:
 *                   type: string
 *                   example: "Poll updated successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 question: "What is your favorite programming language? (Updated)"
 *                 created_by: 1
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-15T11:00:00Z"
 *               message: "Poll updated successfully"
 *       404:
 *         description: Poll not found
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

/**
 * @swagger
 * /api/polls/{id}:
 *   delete:
 *     summary: Delete a poll
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Poll deleted successfully
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
 *                   example: "Poll deleted successfully"
 *             example:
 *               success: true
 *               message: "Poll deleted successfully"
 *       404:
 *         description: Poll not found
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
      const id = Number(req.params.id);
      await pollService.deletePoll(id);
      res.json({ success: true, message: 'Poll deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/polls/{id}/results:
 *   get:
 *     summary: Get poll results with vote counts
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Poll results with vote counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PollResults'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 question: "What is your favorite programming language?"
 *                 created_by: 1
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-15T10:30:00Z"
 *                 options:
 *                   - id: 1
 *                     text: "JavaScript"
 *                     vote_count: 42
 *                   - id: 2
 *                     text: "Python"
 *                     vote_count: 35
 *                   - id: 3
 *                     text: "TypeScript"
 *                     vote_count: 23
 *                 total_votes: 100
 *       404:
 *         description: Poll not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/polls/{id}/options:
 *   get:
 *     summary: Get all options for a poll
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of poll options
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
 *                     $ref: '#/components/schemas/PollOption'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   poll_id: 1
 *                   text: "JavaScript"
 *                 - id: 2
 *                   poll_id: 1
 *                   text: "Python"
 *                 - id: 3
 *                   poll_id: 1
 *                   text: "TypeScript"
 *       404:
 *         description: Poll not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/polls/{id}/options:
 *   post:
 *     summary: Add an option to a poll
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddPollOptionRequest'
 *           example:
 *             text: "Go"
 *     responses:
 *       201:
 *         description: Option added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PollOption'
 *             example:
 *               success: true
 *               data:
 *                 id: 4
 *                 poll_id: 1
 *                 text: "Go"
 *       404:
 *         description: Poll not found
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

/**
 * @swagger
 * /api/polls/{pollId}/options/{optionId}:
 *   delete:
 *     summary: Delete a poll option
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *         example: 1
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Option ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Option deleted successfully
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
 *                   example: "Option deleted"
 *             example:
 *               success: true
 *               message: "Option deleted"
 *       404:
 *         description: Poll or option not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
