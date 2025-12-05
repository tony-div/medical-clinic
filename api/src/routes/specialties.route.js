import express from 'express';
import {
    getSpecialties,
    createSpecialty,
    getSpecialtyByID
} from '../controllers/specialties.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';

const specialtiesRouter = express.Router();

specialtiesRouter.get('/', getSpecialties);

specialtiesRouter.post('/', authenticate, createSpecialty);

specialtiesRouter.get('/:specialty_id', getSpecialtyByID);
export default specialtiesRouter;
