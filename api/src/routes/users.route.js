import express from 'express';
import {
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  loginUser,
} from '../controllers/users.controller.js';

const usersRouter = express.Router();

usersRouter.get('/:userId', getUserById);

usersRouter.patch('/:userId', updateUser);

usersRouter.delete('/:userId', deleteUser);

usersRouter.post('/', createUser);

usersRouter.post('/login', loginUser);

export default usersRouter;