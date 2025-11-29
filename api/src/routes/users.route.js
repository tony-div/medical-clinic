import express from 'express';
import { authenticate } from "../middleware/auth.middleware.js";

import {
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  loginUser,
} from '../controllers/users.controller.js';

const usersRouter = express.Router();

usersRouter.post('/', createUser);
usersRouter.post('/login', loginUser);

usersRouter.get('/:userId', getUserById);
usersRouter.patch('/:userId', authenticate, updateUser);
usersRouter.delete('/:userId', authenticate, deleteUser);

export default usersRouter;
