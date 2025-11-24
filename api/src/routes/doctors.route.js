import express from 'express';
import {
  getDoctors,
  getDoctorById,
} from '../controllers/doctors.controller.js';

const doctorsRouter = express.Router();

doctorsRouter.get('/', getDoctors);

doctorsRouter.get('/:doctorId', getDoctorById);

export default doctorsRouter;
