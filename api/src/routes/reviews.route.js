import express from 'express';
import {
  getReviewsByDoctorId,
  createReview,
  getRatingById
} from '../controllers/reviews.controller.js';
import { authenticate } from "../middleware/auth.middleware.js";

const reviewsRouter = express.Router();

reviewsRouter.get('/:doctorId', getReviewsByDoctorId);

reviewsRouter.post('/', authenticate, createReview);

reviewsRouter.get('/rating/:ratingId', getRatingById);

export default reviewsRouter;
