import express from 'express';
import {
    getTimeSlots
} from '../controllers/time-slots.controller.js';

const timeSlotsRouter = express.Router();

timeSlotsRouter.get('/:doctorId', getTimeSlots);

export default timeSlotsRouter; 