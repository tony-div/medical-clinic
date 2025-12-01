import { db } from '../../config/database.js';
import { query } from '../query/user.query.js';
import { code } from '../http.code.js';
import Joi from 'joi';

export const getDiagnosisByAppointmentId = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const loggedUser = req.user;
    const [appointments] = await db.query(query.SELECT_APPOINTMENT_BY_ID, [appointmentId]);
    if (appointments.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "Appointment Id doesn't exist" });
    }
    const appointment = appointments[0];
    if ((loggedUser.role === "patient" && loggedUser.id !== Number(appointment.user_id)) || (loggedUser.role === "doctor" && loggedUser.doc_id !== Number(appointment.doctor_id))) {
      return res.status(code.FORBIDDEN).json({ error: "Appointment doesn't concern you" });
    }
    if (!appointment.diagnosis_id) {
      return res.status(code.NOT_FOUND).json({ error: "No diagnosis linked to this appointment" });
    }
    const [diagnosisRows] = await db.query(query.SELECT_DIAGNOSIS_BY_ID, [appointment.diagnosis_id]);

    if (diagnosisRows.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "Diagnosis not found" });
    }
    return res.status(code.SUCCESS).json({
      message: "the diagnoses were returned successfully",
      diagnosis: diagnosisRows[0]
    })
  } catch (error) {
    console.log(error);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    })
  }
};

const diagnosisSchema = Joi.object({
  description: Joi.string().max(255).required(),
  prescription: Joi.string().max(255).allow(null, "").optional(),
  treatment_plan: Joi.string().max(255).allow(null, "").optional()
}).unknown(false);


export const createDiagnosis = async (req, res) => {
  try {
    const requester = req.user;
    const appointmentId = req.params.appointmentId;
    if (requester.role !== "doctor") {
      return res.status(code.FORBIDDEN).json({
        error: "Only doctors can create a diagnosis"
      });
    }
    const [appointments] = await db.query(query.SELECT_APPOINTMENT_BY_ID, [appointmentId]);
    if (appointments.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "Appointment not found" });
    }

    const appointment = appointments[0];
    if (appointment.doctor_id !== requester.doc_id) {
      return res.status(code.FORBIDDEN).json({
        error: "You are not assigned to this appointment"
      });
    }

    if (appointment.diagnosis_id) {
      return res.status(code.BAD_REQUEST).json({
        error: "This appointment already has a diagnosis"
      });
    }

    if (appointment.status === "completed") {
      return res.status(code.BAD_REQUEST).json({
        error: "Appointment is already completed"
      });
    }
    const { error } = diagnosisSchema.validate(req.body);
    if (error) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid diagnosis data: " + error.message
      });
    }
    const { description, prescription, treatment_plan } = req.body;
    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
      const [result] = await conn.query(query.CREATE_DIAGNOSIS, [
        description,
        prescription || null,
        treatment_plan || null
      ]);
      await conn.query(query.UPDATE_APPOINTMENT, [{ diagnosis_id: result.insertId, status: "complete" }, appointmentId]);
      await conn.commit();
      conn.release();
    } catch (error) {
      await conn.rollback();
      conn.release();
      throw error;
    }
    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "Diagnosis created successfully"
    });

  } catch (err) {
    console.error("Error creating diagnosis:", err);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};
