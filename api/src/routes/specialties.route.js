import express from 'express';
import {
    getSpecialties,
    createSpecialty,
    getSpecialtyByID,
    deleteSpecialtyById
} from '../controllers/specialties.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';

const specialtiesRouter = express.Router();

specialtiesRouter.get('/', getSpecialties);

specialtiesRouter.post('/', authenticate, createSpecialty);

specialtiesRouter.get('/:specialty_id', getSpecialtyByID);

specialtiesRouter.delete('/:specialty_id', authenticate, deleteSpecialtyById);
export default specialtiesRouter;
