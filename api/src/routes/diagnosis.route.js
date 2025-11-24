import express from 'express';
import {
  getDiagnosisByAppointmentId,
  createDiagnosis,
} from '../controllers/diagnosis.controller.js';

const diagnosisRouter = express.Router();

diagnosisRouter.get('/:appointmentId', getDiagnosisByAppointmentId);

diagnosisRouter.post('/', createDiagnosis);

export default diagnosisRouter;
