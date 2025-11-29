import express from 'express';
import {
  createMedicalTest,
  updateMedicalTest,
  uploadMedicalTestFile,
  getMedicalTestById,
  deleteMedicalTestById,
} from '../controllers/medical-tests.controller.js';

import upload from '../middleware/upload.file.js';

const medicalTestsRouter = express.Router();

medicalTestsRouter.post('/', createMedicalTest);

medicalTestsRouter.patch('/:id', updateMedicalTest);

medicalTestsRouter.get('/:id', getMedicalTestById);

medicalTestsRouter.delete('/:id', deleteMedicalTestById);

medicalTestsRouter.post('/:id/file', upload.single("file"), uploadMedicalTestFile);

export default medicalTestsRouter;
