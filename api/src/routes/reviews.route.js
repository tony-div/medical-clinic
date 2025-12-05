import express from 'express';
import {
  getReviewsByDoctorId,
  createReview,
} from '../controllers/reviews.controller.js';
import { authenticate } from "../middleware/auth.middleware.js";

const reviewsRouter = express.Router();

reviewsRouter.get('/:doctorId', getReviewsByDoctorId);

reviewsRouter.post('/', authenticate, createReview);

export default reviewsRouter;
