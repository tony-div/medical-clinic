import { db } from '../../config/database.js';
import { code } from '../http.code.js';
import { query } from '../query/user.query.js';

export const getDoctors = async (req, res) => {
  const query = `
    SELECT D.id, User.name AS name, Specialty.name AS specialty, D.profile_pic_path, DoctorRating.avg_rating, D.consultation_fees
    FROM DOCTOR AS D
    JOIN User ON D.user_id = User.id 
    JOIN Specialty ON D.specialty_id = Specialty.id
    JOIN DoctorRating ON D.rating_id = DoctorRating.id
    `
  try{
    const [rows, fields] = await db.query(query);

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
  const [rows, fields] = await db.query(query, [doctorId]);

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


//add schedules to doctor? create schedules? 
