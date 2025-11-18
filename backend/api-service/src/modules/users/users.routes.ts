import { Router, Request, Response, NextFunction } from 'express';
import usersService from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  paramsSchema,
} from './users.schema';
import validate from '../../shared/middlewares/validate';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         username:
 *           type: string
 *           description: Username (alphanumeric and underscores only)
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "john@example.com"
 *         telegram_id:
 *           type: string
 *           nullable: true
 *           description: Telegram user ID
 *           example: "123456789"
 *         full_name:
 *           type: string
 *           nullable: true
 *           description: User's full name
 *           example: "John Doe"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           pattern: "^[a-zA-Z0-9_]+$"
 *           description: Username (alphanumeric and underscores only)
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: User email address
 *           example: "john@example.com"
 *         telegram_id:
 *           type: string
 *           nullable: true
 *           pattern: "^\\d+$"
 *           maxLength: 20
 *           description: Telegram user ID (numeric string)
 *           example: "123456789"
 *         full_name:
 *           type: string
 *           nullable: true
 *           maxLength: 255
 *           description: User's full name
 *           example: "John Doe"
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           pattern: "^[a-zA-Z0-9_]+$"
 *           description: Username (alphanumeric and underscores only)
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: User email address
 *           example: "john@example.com"
 *         telegram_id:
 *           type: string
 *           nullable: true
 *           pattern: "^\\d+$"
 *           maxLength: 20
 *           description: Telegram user ID (numeric string)
 *           example: "123456789"
 *         full_name:
 *           type: string
 *           nullable: true
 *           maxLength: 255
 *           description: User's full name
 *           example: "John Doe"
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
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
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                   telegram_id: "123456789"
 *                   full_name: "John Doe"
 *                   created_at: "2024-01-15T10:30:00Z"
 *                   updated_at: null
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 username: "john_doe"
 *                 email: "john@example.com"
 *                 telegram_id: "123456789"
 *                 full_name: "John Doe"
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: null
 *       404:
 *         description: User not found
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
      const user = await usersService.getUserById(id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           example:
 *             username: "john_doe"
 *             email: "john@example.com"
 *             telegram_id: "123456789"
 *             full_name: "John Doe"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 username: "john_doe"
 *                 email: "john@example.com"
 *                 telegram_id: "123456789"
 *                 full_name: "John Doe"
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: null
 *               message: "User created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  validate({ body: createUserSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             username: "john_doe_updated"
 *             email: "john.updated@example.com"
 *             full_name: "John Doe Updated"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 username: "john_doe_updated"
 *                 email: "john.updated@example.com"
 *                 telegram_id: "123456789"
 *                 full_name: "John Doe Updated"
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-15T11:00:00Z"
 *               message: "User updated successfully"
 *       404:
 *         description: User not found
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
  validate({ params: paramsSchema, body: updateUserSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;
      const user = await usersService.updateUser(id, req.body);
      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *             example:
 *               success: true
 *               message: "User deleted successfully"
 *       404:
 *         description: User not found
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
      await usersService.deleteUser(id);
      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
