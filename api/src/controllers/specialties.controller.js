import { db } from '../../config/database.js';
import { query } from '../query/user.query.js';
import { code } from '../http.code.js';

export const getSpecialties = async (req, res) => {
  const sqlquery = `
  SELECT *
  FROM Specialty`

  try{
    const [rows, fields] = await db.query(sqlquery);

    return res.status(200).json({
      message: 'ok',
      data: rows
    })

  } catch(error){
    console.error('error',error);
    return res.status(500).json({
      message: 'Internal server error',
      'error':error.message
    })

  }  
};

export const createSpecialty = async (req,res) => {
  try{
    const loggedUser = req.user;
    const {name} = req.body;
    if(loggedUser.role !== "admin"){
      return res.status(500).json({
      error: "only admins may add specialties"
    })
    }
    if(!name){
      return res.status(code.BAD_REQUEST).json({
      error: 'invalid input',
    })
    }
    const [result] = await db.query(query.CREATE_SPECIALTY, [name]);

    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: 'created successfully',
      specialty_id: result.insertId
    })
  }catch(error){
    return res.status(code.SERVER_ERROR).json({
      error: 'Internal server error',
    })
  }
};

export const getSpecialtyByID = async (req, res) => {
  try{
    const specialty_id = req.params.specialty_id;
    const [specialty] = await db.query( query.GET_SPECIALTY_BY_ID, [specialty_id]);

    if (specialty.length === 0) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid specialty_id: specialty does not exist"
      });
    }

    return res.status(code.SUCCESS).json({
      message:"retrieved successfully",
      specialty: specialty
    });
  }catch(error){
    return res.status(code.SERVER_ERROR).json({
      error: 'Internal server error',
    })
  }
};