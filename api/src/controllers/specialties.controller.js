import { db } from '../../config/database.js';

export const getSpecialties = async (req, res) => {
  const query = `
  SELECT *
  FROM Specialty`

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