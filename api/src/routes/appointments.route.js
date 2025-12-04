import express from 'express';
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  getAppointmentsByUserId,
  getAppointmentById
} from '../controllers/appointments.controller.js';

const appointmentsRouter = express.Router();
appointmentsRouter.use(authenticate);
appointmentsRouter.get('/list', getAppointments);

appointmentsRouter.post('/',createAppointment);

appointmentsRouter.patch('/:appointmentId', updateAppointment);

appointmentsRouter.get('/shared/:userId', getAppointmentsByUserId);

appointmentsRouter.get('/details/:appointment_id', getAppointmentById);

export default appointmentsRouter;
