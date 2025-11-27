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

export const getDoctorById = (req, res) => {
  const doctorId = req.query.doctorId;
  res.status(501).json({ message: 'Not implemented' });
};