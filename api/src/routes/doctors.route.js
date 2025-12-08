import express from 'express';
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getDoctors,
  getDoctorByDocId,
  getDoctorByUserId,
  getDoctorsBySpecialty,
  getDoctorScheduleByDocId,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/doctors.controller.js';

const doctorsRouter = express.Router();

doctorsRouter.get('/', getDoctors);

doctorsRouter.get('/profile-doctor-id/:doctorId', getDoctorByDocId);
doctorsRouter.get('/profile-user-id/:userId', getDoctorByUserId);

doctorsRouter.get('/specialty/:specialtyId', getDoctorsBySpecialty);

doctorsRouter.get('/schedule/:doctorId', getDoctorScheduleByDocId);

doctorsRouter.post('/schedule/', authenticate, createSchedule);

doctorsRouter.patch('/schedule/:scheduleId', authenticate, updateSchedule);

doctorsRouter.delete('/schedule/:scheduleId', authenticate, deleteSchedule);

export default doctorsRouter;
