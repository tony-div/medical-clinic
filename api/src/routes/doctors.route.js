import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialty
} from '../controllers/doctors.controller.js';

const doctorsRouter = express.Router();

doctorsRouter.get('/', getDoctors);

doctorsRouter.get('/profile/:doctorId', getDoctorById);

doctorsRouter.get('/specialty/:specialtyId', getDoctorsBySpecialty);

export default doctorsRouter;
