import express from 'express';
import {
    getSpecialties
} from '../controllers/specialties.controller.js'

const specialtiesRouter = express.Router();

specialtiesRouter.get('/', getSpecialties);

export default specialtiesRouter;
