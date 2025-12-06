import { db } from '../../config/database.js';
import { code } from '../http.code.js';
import { query } from '../query/user.query.js';
import Joi from 'joi';

export const getDoctors = async (req, res) => {
  const query = `
  SELECT
      D.id AS id,
      U.name AS name,
      S.name AS specialty_name,
      D.profile_pic_path,
      D.consultation_fees,
      D.waiting_time,
      D.about_doctor,
      D.education_and_experience,
      D.status,
      D.rating_id,

      DR.avg_rating,
      DR.reviews_count

  FROM Doctor AS D
  JOIN User AS U ON D.user_id = U.id
  LEFT JOIN Specialty AS S ON D.specialty_id = S.id
  LEFT JOIN DoctorRating AS DR ON D.rating_id = DR.id;

  `;

  try {
    const [rows] = await db.query(query);

    res.status(200).json({
      message: 'ok',
      data: rows
    });

  } catch (error) {
    console.error('error', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getDoctorsBySpecialty = async (req, res) => {
  const specialtyId = req.params.specialtyId;
  const query = `
  Select D.id, User.name AS name, Specialty.name AS specialty, D.profile_pic_path, DoctorRating.avg_rating, D.consultation_fees
    FROM DOCTOR AS D
    JOIN User ON D.user_id = User.id 
    JOIN Specialty ON D.specialty_id = Specialty.id
    JOIN DoctorRating ON D.rating_id = DoctorRating.id
    WHERE D.specialty_id = ?
    `
    try{
    const [rows, fields] = await db.query(query, [specialtyId]);

    res.status(200).json({
      message: 'ok',
      data: rows
    })

  } catch(error){
    console.error('error',error);
    res.status(500).json({
      message: 'Internal server error',
      'error':error.message
    })

  }
};

export const getDoctorById = async (req, res) => {
  const doctorId = req.params.doctorId;
  const query = `
    Select D.id, 
    User.name AS name, 
    Specialty.name AS specialty, 
    D.profile_pic_path, 
    DoctorRating.avg_rating, 
    D.consultation_fees, 
    D.waiting_time, 
    D.about_doctor, 
    D.education_and_experience
    FROM DOCTOR AS D
    JOIN User ON D.user_id = User.id 
    JOIN Specialty ON D.specialty_id = Specialty.id
    JOIN DoctorRating ON D.rating_id = DoctorRating.id
    WHERE D.id = ?;
    `
  
  try{
  const [rows] = await db.query(query, [doctorId]);

  res.status(200).json({
    message: 'ok',
    data: rows
  })

  } catch(error){
    console.error('error',error);
    res.status(500).json({
      message: 'Internal server error',
      'error':error.message
    })

  }
};

export const getDoctorScheduleByDocId = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);

    if (isNaN(doctorId)) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid doctor ID"
      });
    }
    const [doctorRows] = await db.query(query.SELECT_DOCTOR_BY_ID, [doctorId]);
    if (doctorRows.length === 0) {
      return res.status(code.NOT_FOUND).json({
        error: "Doctor does not exist"
      });
    }
    const [scheduleRows] = await db.query(query.SELECT_SCHEDULE_BY_DOCTOR_ID, [doctorId]);
    return res.status(code.SUCCESS).json({
      message: "Doctor schedule retrieved successfully",
      schedule: scheduleRows
    });

  } catch (error) {
    console.log("Error retrieving doctor schedule:", error);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};

const createScheduleSchema = Joi.object({
day: Joi.string().valid("Sun","Mon","Tue","Wed","Thur","Sat","Fri").required(),
starts_at:Joi.string().required(),
ends_at:Joi.string().required(),
slot_duration: Joi.number().integer().required(),
}).unknown(false);

export const createSchedule = async (req, res) => {
  try{
    const loggedUser = req.user;
    if(loggedUser.role !== "doctor"){
      return res.status(code.FORBIDDEN).json({error:"only doctors may add schedules"});
    }
    const {day, starts_at, ends_at, slot_duration} = req.body;
    const scheduleInputs = {day, starts_at, ends_at, slot_duration};
    const {error} = createScheduleSchema.validate(scheduleInputs);
    if(error){
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid entered data: " + error.message
      });
    }
    const doctorId = loggedUser.doc_id;
    const [doctorRows] = await db.query(query.SELECT_DOCTOR_BY_ID, [doctorId]);
    if (doctorRows.length === 0) {
      return res.status(code.NOT_FOUND).json({
        error: "Doctor account not found in database",
      });
    }
    const [result] = await db.query(query.CREATE_SCHEDULE, [
        loggedUser.doc_id,
        day,
        starts_at,
        ends_at,
        slot_duration
      ]);
    return res.status(code.CREATED_SUCCESSFULLY).json({message:"created successfully", schedule_id: result.insertId});
  }catch(error){
    console.log(error);
    return res.status(code.SERVER_ERROR).json({error: "Internal server error"});
  }
};
const updateScheduleSchema = Joi.object({
  starts_at: Joi.string().optional(),
  ends_at: Joi.string().optional(),
  slot_duration: Joi.number().integer().optional(),
}).unknown(false).min(1);

export const updateSchedule = async (req, res) => {
  try {
    const loggedUser = req.user;
    const scheduleId = req.params.scheduleId;
    
    if (loggedUser.role !== "doctor") {
      return res.status(code.FORBIDDEN).json({
        error: "Doctors may only update their own schedules"
      });
    }
    const newSchedule = {};
    for (const key in req.body) {
      if (req.body[key] !== undefined) newSchedule[key] = req.body[key];
    }
    const { error } = updateScheduleSchema.validate(newSchedule);
    if (error) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid entered data: " + error.message
      });
    }
    const [schedules] = await db.query( query.SELECT_SCHEDULE_BY_ID, [scheduleId]);
    if (schedules.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "Schedule not found" });
    }
    if (schedules[0].doctor_id !== loggedUser.doc_id) {
      return res.status(code.FORBIDDEN).json({
        error: "You can only update your own schedules"
      });
    }
    const [result] = await db.query(query.UPDATE_SCHEDULE_BY_ID, [newSchedule, scheduleId]);
    return res.status(code.SUCCESS).json({
      message: "Updated successfully",
      affected: result.affectedRows
    });
  } catch (error) {
    console.log(error);
    return res
    .status(code.SERVER_ERROR)
    .json({ error: "Internal server error" });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "doctor") {
      return res.status(code.FORBIDDEN).json({
        error: "Only doctors may delete schedules"
      });
    }
    const schedule_id = Number(req.params.scheduleId);
    if (!schedule_id || isNaN(schedule_id)) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid schedule_id"
      });
    }
    const [schedules] = await db.query(query.SELECT_SCHEDULE_BY_ID, [
      schedule_id,
    ]);
    if (schedules.length === 0) {
      return res.status(code.NOT_FOUND).json({
        error: "Schedule not found",
      });
    }
    if (schedules[0].doctor_id !== loggedUser.doc_id) {
      return res.status(code.FORBIDDEN).json({
        error: "You can only delete your own schedules",
      });
    }
    const [result] = await db.query(query.DELETE_SCHEDULE_BY_ID, [
      schedule_id,
    ]);
    return res.status(code.SUCCESS).json({
      message: "Schedule deleted successfully",
      affected: result.affectedRows,
    });
  } catch (error) {
    console.log(error);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error",
    });
  }
};
