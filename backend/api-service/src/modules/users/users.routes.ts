import { Router, Request, Response, NextFunction } from 'express';
import usersService from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  paramsSchema,
} from './users.schema';
import validate from '../../shared/middlewares/validate';

const router = Router();

// GET /api/users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
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

// POST /api/users
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

// PUT /api/users/:id
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

// DELETE /api/users/:id
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
