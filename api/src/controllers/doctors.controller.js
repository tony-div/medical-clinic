import db from '../../database.js';

export const getDoctors = async (req, res) => {
  const query = `
    SELECT Doctor.id, User.name AS name, Specialty.name AS specialty, profile_pic_path, DoctorRating.avg_rating
    FROM DOCTOR
    JOIN User ON Doctor.user_id = User.id 
    JOIN Specialty ON Doctor.specialty_id = Specialty.id
    JOIN DoctorRating ON Doctor.rating_id = DoctorRating.id
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
  Select Doctor.id, User.name AS name, Specialty.name AS specialty, profile_pic_path, DoctorRating.avg_rating
    FROM DOCTOR
    JOIN User ON Doctor.user_id = User.id 
    JOIN Specialty ON Doctor.specialty_id = Specialty.id
    JOIN DoctorRating ON Doctor.rating_id = DoctorRating.id
    WHERE Doctor.specialty_id = ?
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

//endpoint without returning available slots
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