import express from 'express';
import {
  createMedicalTest,
  //updateMedicalTest,
  uploadMedicalTestFile,
  getMedicalTestById,
  getMedicalTestByAppointmentId
  //deleteMedicalTestById,
} from '../controllers/medical-tests.controller.js';
import { authenticate } from "../middleware/auth.middleware.js";

import upload from '../middleware/upload.file.js';

const medicalTestsRouter = express.Router();

medicalTestsRouter.post('/', authenticate ,createMedicalTest);

//medicalTestsRouter.patch('/:id', updateMedicalTest);

medicalTestsRouter.get('/:id', authenticate, getMedicalTestById);

//medicalTestsRouter.delete('/:id', deleteMedicalTestById);

medicalTestsRouter.post('/:id/file', upload.single("file"), uploadMedicalTestFile);

medicalTestsRouter.get('/appointment/:appointmentId', authenticate, getMedicalTestByAppointmentId);

export default medicalTestsRouter;
