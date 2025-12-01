import express from 'express';
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getDiagnosisByAppointmentId,
  createDiagnosis,
} from '../controllers/diagnosis.controller.js';

const diagnosisRouter = express.Router();

diagnosisRouter.get('/:appointmentId', authenticate, getDiagnosisByAppointmentId);

diagnosisRouter.post('/:appointmentId', authenticate , createDiagnosis);

export default diagnosisRouter;
