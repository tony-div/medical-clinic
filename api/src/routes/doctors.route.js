import express from 'express';
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialty,
  getDoctorScheduleByDocId,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/doctors.controller.js';

const doctorsRouter = express.Router();

doctorsRouter.get('/', getDoctors);

doctorsRouter.get('/profile/:doctorId', getDoctorById);

doctorsRouter.get('/specialty/:specialtyId', getDoctorsBySpecialty);

doctorsRouter.get('/schedule/:doctorId', getDoctorScheduleByDocId);

doctorsRouter.get('/schedule/add', authenticate, createSchedule);

doctorsRouter.get('/schedule/update', authenticate, updateSchedule);

doctorsRouter.get('/schedule/delete', authenticate, deleteSchedule);

export default doctorsRouter;
