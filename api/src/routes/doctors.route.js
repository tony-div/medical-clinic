import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialty,
  getDoctorScheduleByDocId
} from '../controllers/doctors.controller.js';

const doctorsRouter = express.Router();

doctorsRouter.get('/', getDoctors);

doctorsRouter.get('/profile/:doctorId', getDoctorById);

doctorsRouter.get('/specialty/:specialtyId', getDoctorsBySpecialty);

doctorsRouter.get('/schedule/:doctorId', getDoctorScheduleByDocId);

export default doctorsRouter;
