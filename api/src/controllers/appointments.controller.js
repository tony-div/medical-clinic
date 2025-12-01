import { db } from '../../config/database.js';
import { query } from '../query/user.query.js';
import { code } from '../http.code.js';
import Joi from 'joi';

export const getAppointments = async (req, res) => {
  try{
    const loggedUser = req.user;
    if(loggedUser.role !== "admin"){
      return res.status(code.FORBIDDEN).json({
        error: "Only admins can see all appointments"
      });
    }

    const [result] = await db.query(query.GET_ALL_APPOINTMENTS)
    return res.status(code.SUCCESS).json({
      message: "retrieved successfully",
      Appointments: result
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
    const [doctorRows] = await db.query(query.SELECT_DOCTOR_BY_ID, [doctor_id]);
    if (doctorRows.length === 0) {
      return res.status(code.NOT_FOUND).json({
        error: "Doctor does not exist"
      });
    }
    const [result] = await db.query(query.CREATE_APPOINTMENT, [loggedUser.id,doctor_id,reason,date,starts_at,ends_at,null,"scheduled"]);
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

      if (oldAppointment.status === "cancelled") {
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
    if (loggedUser.role === "admin") {
      const [userAppointments, doctorAppointments] = await Promise.all([
        db.query(query.SELECT_APPOINTMENT_BY_USERID, [paramId]).then(r => r[0]),
        db.query(query.SELECT_APPOINTMENT_BY_DOCID, [paramId]).then(r => r[0])
      ]);

      return res.status(code.SUCCESS).json({
        message: "retrieved successfully",
        Appointments: [...userAppointments, ...doctorAppointments]
      });
    }
    console.log(req.user);
    if ((loggedUser.role === "patient" && loggedUser.id !== paramId) || 
        loggedUser.role === "doctor" && loggedUser.doc_id !== paramId) {
      return res.status(code.FORBIDDEN).json({
        error: "other people's data is private"
      });
    }
    if (loggedUser.role === "patient") {
      const [result] = await db.query(query.SELECT_APPOINTMENT_BY_USERID, [loggedUser.id]);
      return res.status(code.SUCCESS).json({
        message: "retrieved successfully",
        Appointments: result
      });
    }
    if (loggedUser.role === "doctor") {
      console.log("REQ.USER =", req.user);
      const [result] = await db.query(query.SELECT_APPOINTMENT_BY_DOCID, [loggedUser.doc_id]);
      return res.status(code.SUCCESS).json({
        message: "retrieved successfully",
        Appointments: result
      });
    }
    return res.status(code.BAD_REQUEST).json({
      error: "Invalid role"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};

