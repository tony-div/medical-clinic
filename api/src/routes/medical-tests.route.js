import express from 'express';
import {
  createMedicalTest,
  updateMedicalTest,
  deleteMedicalTest,
  uploadMedicalTestFile,
  getMedicalTestById,
  deleteMedicalTestById,
} from '../controllers/medical-tests.controller.js';

const medicalTestsRouter = express.Router();

medicalTestsRouter.post('/', createMedicalTest);

medicalTestsRouter.patch('/', updateMedicalTest);

medicalTestsRouter.delete('/', deleteMedicalTest);

medicalTestsRouter.get('/:medicalTestId', getMedicalTestById);

medicalTestsRouter.delete('/:medicalTestId', deleteMedicalTestById);

medicalTestsRouter.post('/file', uploadMedicalTestFile);

export default medicalTestsRouter;
