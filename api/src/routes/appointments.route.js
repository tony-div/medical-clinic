import express from 'express';
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  getAppointmentsByUserId,
} from '../controllers/appointments.controller.js';

const appointmentsRouter = express.Router();
appointmentsRouter.use(authenticate);
appointmentsRouter.get('/', getAppointments);

appointmentsRouter.post('/',createAppointment);

appointmentsRouter.patch('/:appointmentId', updateAppointment);

appointmentsRouter.get('/:userId', getAppointmentsByUserId);

export default appointmentsRouter;
