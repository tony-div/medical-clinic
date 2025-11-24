import express from 'express';
import {
  getReviewsByDoctorId,
  createReview,
} from '../controllers/reviews.controller.js';

const reviewsRouter = express.Router();

reviewsRouter.get('/:doctorId', getReviewsByDoctorId);

reviewsRouter.post('/:doctorId', createReview);

export default reviewsRouter;
