import express from 'express';
import { authenticate } from "../middleware/auth.middleware.js";

import {
  getUserById,
  updateUser,
  deleteUser,
  createPatient,
  createAdmin,
  createDoctor,
  loginUser,
} from '../controllers/users.controller.js';

const usersRouter = express.Router();

usersRouter.post("/", createPatient);
usersRouter.post("/admin", authenticate, createAdmin);
usersRouter.post("/doctor", authenticate, createDoctor);
usersRouter.post('/login', loginUser);

usersRouter.get('/:userId', authenticate, getUserById);
usersRouter.patch('/:userId', authenticate, updateUser);
usersRouter.delete('/:userId', authenticate, deleteUser);

export default usersRouter;
