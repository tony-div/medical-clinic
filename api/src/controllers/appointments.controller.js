import { db } from '../../config/database.js';
import { query } from '../query/user.query.js';
import { code } from '../http.code.js';
import Joi from 'joi';
import {
  sendAppointmentEmail,
  sendCancelledAppointmentEmail,
  sendRescheduledAppointmentEmail
} from "../services/mail.service.js";


export const getAppointments = async (req, res) => {
  try{
    const loggedUser = req.user;
    if(loggedUser.role === "doctor"){
      console.log("REQ.USER =", req.user);
      const [result] = await db.query(query.SELECT_APPOINTMENT_BY_DOCID, [loggedUser.doc_id]);
      return res.status(code.SUCCESS).json({
        message: "retrieved successfully",
        appointments: result
      });
    }
    if(loggedUser.role === "patient"){
      const [result] = await db.query(query.SELECT_APPOINTMENT_BY_USERID, [loggedUser.id]);
      return res.status(code.SUCCESS).json({
        message: "retrieved successfully",
        appointments: result
      });
    }
    if(loggedUser.role === "admin"){
      const [result] = await db.query(query.GET_ALL_APPOINTMENTS)
      return res.status(code.SUCCESS).json({
        message: "retrieved successfully",
        appointments: result
      });
    }
    return res.status(code.FORBIDDEN).json({
        error: "unidentified role"
      });
  } catch (error) {
    console.log(error.message);
    return res.status(code.BAD_REQUEST).json({
        error: "Internal server error"
      });
  }
};

const createAppointmentSchema = Joi.object({
  doctor_id: Joi.number().integer().required(),
  reason: Joi.string().max(255).required(),
  date: Joi.date().required(),
  starts_at: Joi.string().max(8).required(),
  ends_at: Joi.string().max(8).required(),
}).unknown(false);

export const createAppointment = async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "patient") {
      return res.status(code.FORBIDDEN).json({
        error: "Only patients can book appointments"
      });
    }

    const { doctor_id, reason, date, starts_at, ends_at } = req.body;
    const patientInput = { doctor_id, reason, date, starts_at, ends_at };
    const { error } = createAppointmentSchema.validate(patientInput);
    if (error) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid entered data: " + error.message
      });
    }
    const [[doctorRow]] = await db.query(query.SELECT_DOCTOR_BY_ID, [doctor_id]);
    if (!doctorRow) {
      return res.status(code.NOT_FOUND).json({
        error: "Doctor does not exist"
      });
    }

    const [[doctorUser]] = await db.query(query.SELECT_USER_BY_ID, [doctorRow.user_id]);
    if (!doctorUser) {
      return res.status(code.NOT_FOUND).json({
        error: "Doctor's user profile not found"
      });
    }

    const [[patient]] = await db.query(query.SELECT_USER_BY_ID, [loggedUser.id]);
    if (!patient) {
      return res.status(code.NOT_FOUND).json({ error: "Patient not found" });
    }

    const [result] = await db.query(query.CREATE_APPOINTMENT, [loggedUser.id,doctor_id,reason,date,starts_at,ends_at,null,"scheduled"]);
    await sendAppointmentEmail(
        patient.email,
        patient.name,
        doctorUser.name,
        date,
        starts_at,
        doctorUser.address
    );
    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "created successfully",
      appointment_id: result.insertId
    });
  } catch (error) {
    console.log(error.message);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};

const updateAppointmentSchema = Joi.object({
  reason: Joi.string().max(255).optional(),
  date: Joi.date().optional(),
  starts_at: Joi.string().max(8).optional(),
  ends_at: Joi.string().max(8).optional(),
  status: Joi.string()
      .valid("scheduled", "cancelled", "rescheduled")
      .optional()
}).min(1).unknown(false);
export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    console.log("PARAM:", appointmentId);
    let newAppointment = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        newAppointment[key] = req.body[key];
      }
    });
    const { error } = updateAppointmentSchema.validate(newAppointment);
    if (error) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid entered data: " + error.message
      });
    }
    const loggedUser = req.user;
    if (loggedUser.role === "admin") {
      return res.status(code.FORBIDDEN).json({ error: "Admins cannot update appointments" });
    }
    const [oldData] = await db.query(query.SELECT_APPOINTMENT_BY_ID, [appointmentId]);
    if (oldData.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "Appointment does not exist" });
    }
    const oldAppointment = oldData[0];
    if (loggedUser.role === "patient") {
      if (loggedUser.id !== oldAppointment.user_id) {
        return res.status(code.FORBIDDEN).json({ error: "Cannot modify another user's appointment" });
      }
      if (!(Object.keys(newAppointment).length === 1 && newAppointment.status === "cancelled")) {
        return res.status(code.FORBIDDEN).json({
          error: "Patients may only cancel their own appointments"
        });
      }
    }
    if (loggedUser.role === "doctor") {
      console.log(loggedUser.doc_id);
      console.log(oldAppointment.doctor_id);
      if (loggedUser.doc_id !== oldAppointment.doctor_id) {
        return res.status(code.FORBIDDEN).json({ error: "Cannot modify another doctor's appointment" });
      }

      if (oldAppointment.status === "cancelled" || oldAppointment.status === "complete") {
        return res.status(code.BAD_REQUEST).json({
          error: "Cannot modify an appointment that is already complete or cancelled"
        });
      }
      const allowedDoctorFields = ["status", "date", "starts_at", "ends_at", "reason"];
      const illegalField = Object.keys(newAppointment).find(
        key => !allowedDoctorFields.includes(key)
      );
      if (illegalField) {
        return res.status(code.FORBIDDEN).json({
          error: `Doctors may not modify '${illegalField}'`
        });
      }
    }
    const [result] = await db.query(query.UPDATE_APPOINTMENT, [newAppointment, appointmentId]);
    if(newAppointment.status){
        const [[patientUser]] = await db.query(query.SELECT_USER_BY_ID, [oldAppointment.user_id]);
        const [[doctorRow]] = await db.query(query.SELECT_DOCTOR_BY_ID, [oldAppointment.doctor_id]);
        if (!doctorRow) {
          return res.status(code.NOT_FOUND).json({ error: "Doctor does not exist" });
        }
        const [[doctorUser]] = await db.query(query.SELECT_USER_BY_ID, [doctorRow.user_id]);
        if (!doctorUser) {
          return res.status(code.NOT_FOUND).json({ error: "Doctor's user profile not found" });
        }
      if(newAppointment.status === "cancelled"){
        await sendCancelledAppointmentEmail(
          patientUser.email,
          patientUser.name,
          doctorUser.name,
          oldAppointment.date,
          oldAppointment.starts_at
        );
      }else if(newAppointment.status === "rescheduled"){
        await sendRescheduledAppointmentEmail(
          patientUser.email,
          patientUser.name,
          doctorUser.name,
          oldAppointment.date,
          oldAppointment.starts_at,
          newAppointment.date,
          newAppointment.starts_at
        );
      }
    }
    return res.status(code.SUCCESS).json({
      message: "success",
      updated: newAppointment
    });
  } catch (error) {
    console.log(error.message);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};


export const getAppointmentsByUserId = async (req, res) => {
  try {
    const paramId = Number(req.params.userId);
    const loggedUser = req.user;

    if (!paramId || isNaN(paramId)) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid ID parameter"
      });
    }
    if (loggedUser.role === "admin") {
      const [users] = await db.query(query.SELECT_USER_BY_ID, [paramId]);
      const [doctors] = await db.query(query.SELECT_DOCTOR_BY_ID, [paramId]);

      if (users.length === 0 && doctors.length === 0) {
        return res.status(code.NOT_FOUND).json({
          error: "No user or doctor found with the given ID"
        });
      }

      const [userAppointments, doctorAppointments] = await Promise.all([
        db.query(query.SELECT_APPOINTMENT_BY_USERID, [paramId]).then(r => r[0]),
        db.query(query.SELECT_APPOINTMENT_BY_DOCID, [paramId]).then(r => r[0])
      ]);

      return res.status(code.SUCCESS).json({
        message: "Retrieved successfully",
        appointments: [...userAppointments, ...doctorAppointments]
      });
    }
    if (loggedUser.role === "patient") {
      const patientId = loggedUser.id;
      const [doctorRows] = await db.query(query.SELECT_DOCTOR_BY_ID, [paramId]);

      if (doctorRows.length === 0) {
        return res.status(code.NOT_FOUND).json({
          error: "Doctor not found"
        });
      }
      const [appointments] = await db.query( query.SELECT_APPOINTMENTS_SHARED, [patientId, paramId]);
      return res.status(code.SUCCESS).json({
        message: "Retrieved successfully",
        appointments: appointments
      });
    }
    if (loggedUser.role === "doctor") {
      const doctorId = loggedUser.doc_id;

      const [userRows] = await db.query(query.SELECT_USER_BY_ID, [paramId]);

      if (userRows.length === 0) {
        return res.status(code.NOT_FOUND).json({
          error: "Patient not found with the given ID"
        });
      }
      const [appointments] = await db.query( query.SELECT_APPOINTMENTS_SHARED, [paramId, doctorId]);
      return res.status(code.SUCCESS).json({
        message: "Retrieved successfully",
        appointments: appointments
      });
    }
    return res.status(code.FORBIDDEN).json({
      error: "Unauthorized role"
    });

  } catch (error) {
    console.log(error);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const loggedUser = req.user;
    const appointmentId = Number(req.params.appointment_id);

    if (!appointmentId || isNaN(appointmentId)) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid appointment ID"
      });
    }

    // if (loggedUser.role === "admin") {
    //   return res.status(code.FORBIDDEN).json({
    //     error: "Admins are not meant to use this endpoint"
    //   });
    // }

    const [rows] = await db.query(query.SELECT_APPOINTMENT_BY_ID, [appointmentId]);
    if (rows.length === 0) {
      return res.status(code.NOT_FOUND).json({
        error: "Appointment not found"
      });
    }

    const appointment = rows[0];
    if ((loggedUser.role === "patient" && appointment.user_id !== loggedUser.id) 
      || (loggedUser.role === "doctor" && appointment.doc_id !== loggedUser.doctor_id))  {
      return res.status(code.FORBIDDEN).json({
        error: "You are not authorized to view this appointment"
      });
    }
    return res.status(code.SUCCESS).json({
      message: "Appointment retrieved successfully",
      appointment: appointment
    });

  } catch (error) {
    console.log(error);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};
