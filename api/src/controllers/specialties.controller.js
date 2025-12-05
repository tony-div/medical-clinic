import { db } from '../../config/database.js';
import { query } from '../query/user.query.js';
import { code } from '../http.code.js';

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

export const createSpecialty = async (req,res) => {
  try{
    const loggedUser = req.user;
    const {name} = req.body;
    if(loggedUser.role !== "admin"){
      res.status(500).json({
      error: "only admins may add specialties"
    })
    }
    if(!name){
      res.status(code.BAD_REQUEST).json({
      message: 'invalid input',
      'error':error.message
    })
    }
    const [result] = await db.query(query.CREATE_SPECIALTY, name);

    res.status(code.CREATED_SUCCESSFULLY).json({
      message: 'created successfully',
      specialty_id: result.insertId
    })
  }catch(error){
    res.status(code.SERVER_ERROR).json({
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
    res.status(code.SERVER_ERROR).json({
      error: 'Internal server error',
    })
  }
};