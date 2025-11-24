import express from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  getAppointmentsByUserId,
} from '../controllers/appointments.controller.js';

const appointmentsRouter = express.Router();

appointmentsRouter.get('/', getAppointments);

appointmentsRouter.post('/', createAppointment);

appointmentsRouter.patch('/', updateAppointment);

appointmentsRouter.get('/:userId', getAppointmentsByUserId);

export default appointmentsRouter;
