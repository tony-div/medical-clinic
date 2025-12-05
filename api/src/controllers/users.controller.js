import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/database.js";
import { query } from "../query/user.query.js";
import { code } from "../http.code.js";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./../infra/.env') });

export const getUserById = async (req, res) => {
  let limitedFlag = false;
    try{
      const id = req.params.userId;
      const loggedUser = req.user;
      if(loggedUser.id !== Number(id) && loggedUser.role === "patient"){
        return res.status(401).json({error:"Unauthorized"})
      }
      if(loggedUser.role !== "admin"){
        limitedFlag = true;
      }
      const [user] = await db.query(query.SELECT_USER_BY_ID, [id])
      if(user.length === 0){
        return res.status(code.NOT_FOUND).json({error: "User not found"});
      }
      if(user[0].role === "doctor"){
        console.log("more info on the doctor can be fetched from the doctor endpoint");
      }
      if(limitedFlag){
        const { email, name, gender, birth_date } = user[0];
        const limitedUser = { email, name, gender, birth_date };
        return res.status(code.SUCCESS).json({
        message: "success",
        user: limitedUser
        });
      }
      const { password, ...safeUser } = user[0];
      return res.status(code.SUCCESS).json({
        message: "success",
        user: safeUser
      });
    }catch(error){
      console.error(error);
      return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
    }
};


const updateUserSchema = Joi.object({
  email: Joi.string().email().max(255).optional(),
  password: Joi.string().min(6).max(255).optional(),
  name: Joi.string().max(255).optional(),
  phone_number: Joi.string().max(255).optional(),
  address: Joi.string().max(255).allow(null, "").optional(),
  gender: Joi.string().valid("male", "female").allow(null).optional(),
  birth_date: Joi.date().iso().allow(null).optional(),
  role: Joi.string().valid("patient", "doctor", "admin").optional()
}).unknown(true);
const addDoctorSchema = Joi.object({
  specialty_id: Joi.number().integer().optional(),
  profile_pic_path: Joi.string().max(500).allow("",null).optional(),
  rating_id: Joi.number().optional(),
  consultation_fees: Joi.number().optional(),
  waiting_time: Joi.number().optional(),
  about_doctor: Joi.string().max(255).allow("", null).optional(),
  education_and_experience: Joi.string().max(255).allow("", null).optional(),
  status: Joi.string().valid("active","inactive")
}).unknown(true);
export const updateUser = async (req, res) => {
  let docFlag = false;
  let updatedDoc = null;
  try {
      const userId = req.params.userId;
      const loggedUser = req.user;
      if(loggedUser.role === "doctor"){
        return res.status(code.FORBIDDEN).json({ error: "You're not permitted to update this person's info" });
      }
      const { error } = updateUserSchema.validate(req.body);
      if (error) {
        console.log(error.message);
        return res.status(code.BAD_REQUEST).json({
          error: "An invalid entry was entered, please check the inputs"
        });
      }

      const { email, password, name, phone_number, address, gender, birth_date, role } = req.body;
      let updatedUser = { email, password, name, phone_number, address, gender, birth_date, role };
      const [rows] = await db.query(query.SELECT_USER_BY_ID, [userId]);
      if (rows.length === 0) {
        return res.status(code.NOT_FOUND).json({ error: "User not found" });
      }
      const oldUser = rows[0];
      const doctorFieldNames = ["specialty_id","profile_pic_path","rating_id","consultation_fees","waiting_time","about_doctor","education_and_experience","status"];
      const doctorFieldsSent = doctorFieldNames.filter(f => req.body[f] !== undefined);
      if (doctorFieldsSent.length > 0) {
        const [rows2] = await db.query(query.SELECT_DOCTOR_BY_USERID, [userId]);
        if (rows2.length !== 0) {
          docFlag=true;
          const { error } = addDoctorSchema.validate(req.body);
          if (error) {
            console.log(error.message);
            return res.status(code.BAD_REQUEST).json({
              error: "An invalid entry was entered, please check the inputs"
            });
          }
          const {specialty_id, profile_pic_path, rating_id, consultation_fees, waiting_time, about_doctor, education_and_experience, status } = req.body;
          updatedDoc = {specialty_id, profile_pic_path, rating_id, consultation_fees, waiting_time, about_doctor, education_and_experience, status }
          Object.keys(updatedDoc).forEach(key => {
            if (updatedDoc[key] === undefined) delete updatedDoc[key];
          });
        } else {
          return res.status(code.BAD_REQUEST).json({
            error: "This user is not a doctor, doctor fields are not allowed"
          });
        }
      }

    if (loggedUser.role === "patient") {
      if (loggedUser.id !== Number(userId)) {
        return res.status(code.FORBIDDEN).json({
          error: "You are not authorized to update another user's account"
        });
      }
      delete updatedUser.role ;
      if (doctorFieldsSent.length > 0) {
        return res.status(code.FORBIDDEN).json({
          error: "Patients cannot update doctor-specific information"
        });
      }
    }

    if(updatedUser.role !== undefined && ((updatedUser.role !== "doctor" && oldUser.role === "doctor") || (oldUser.role !== "doctor" && updatedUser.role === "doctor"))){
      return res.status(code.BAD_REQUEST).json({ error: "Conversion to/from a doctor is not allowed, please create a separate account for them or explicitly delete their account" });
    }

    Object.keys(updatedUser).forEach(key => {
      if (updatedUser[key] === undefined) delete updatedUser[key];
    });

    if (updatedUser.password) {
      // should ask user here to re-enter old password...but how? is it even this endpoint's job?
      updatedUser.password = await bcrypt.hash(updatedUser.password, 10);
    }
    if(docFlag){
      let conn;
      try{
        conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.query(query.UPDATE_DOCTOR_BY_USERID, [updatedDoc, userId]);
        if (Object.keys(updatedUser).length > 0) {
          await conn.query(query.UPDATE_USER_BY_ID, [updatedUser, userId]);
        }
        await conn.commit();
        conn.release();
      }catch(error){
        await conn.rollback();
        conn.release();
        throw error;
      }
    }else {
      if (Object.keys(updatedUser).length > 0) {
          await db.query(query.UPDATE_USER_BY_ID, [updatedUser, userId]);
      }
    }
    return res.status(code.SUCCESS).json({
      message: "User updated successfully",
      updated_user: { id: userId, ...updatedUser }
    });
  } catch (error) {
    console.error(error);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};


export const deleteUser = async (req, res) => {
  const userId = req.params.userId; 
  const requester = req.user;
  let docFlag = false;
  try {
    const [rows] = await db.query(query.SELECT_USER_BY_ID, [userId]);
    if (rows.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "User not found" });
    }

    if ((requester.role !== "admin" && requester.id !== Number(userId)) || requester.role === "doctor") {
      return res.status(code.FORBIDDEN).json({
        error: "You are not authorized to delete this user",
      });
    }
    // const [rows2] = await db.query(query.SELECT_DOCTOR_BY_USERID, [userId]);
    // if(rows2.length !== 0){
    //   docFlag = true;
    // }
    // if(docFlag){
    //   let conn;
    //   try{
    //     conn = await db.getConnection();
    //     await conn.beginTransaction();
    //     //await conn.query(query.DELETE_DOCTOR_BY_USERID, [userId]);
    //     await conn.query(query.DELETE_USER_BY_ID, [userId]);
    //     await conn.commit();
    //     conn.release();
    //   }catch(error){
    //     await conn.rollback();
    //     conn.release();
    //     throw error;
    //   }
    // }else {}

    await db.query(query.DELETE_USER_BY_ID, [userId]);
    return res.status(code.SUCCESS).json({
      message: "User deleted successfully",
      deleted_user_id: userId,
    });

  } catch (error) {
    console.error(error);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error",
    });
  }
};

const loginUserSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(255).required()
}).unknown(false);


export const loginUser = async (req, res) => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method} ${req.originalUrl}`);

  const { error } = loginUserSchema.validate(req.body);
  if (error) {
    return res.status(code.BAD_REQUEST).json({
      error: "Invalid email or password format"
    });
  }

  const { email, password } = req.body;
  try {
    const [userRows] = await db.query(query.SELECT_USER_BY_EMAIL, [email]);

    if (userRows.length === 0) {
      return res.status(code.FORBIDDEN).json({ error: "Email doesn't exist" });
    }

    const user = userRows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    //const passwordMatch = password === user.password;
    if (!passwordMatch) {
      return res.status(code.FORBIDDEN).json({ error: "Invalid email or password" });
    }
    let doctorId = null;
    if (user.role === "doctor") {
      const [doctorRows] = await db.query(query.SELECT_DOCTOR_BY_USERID, [user.id]);

      if (doctorRows.length === 0) {
        return res.status(code.SERVER_ERROR).json({
          error: "Doctor record not found for this user"
        });
      }

      doctorId = doctorRows[0].id;
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, doc_id: doctorId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(code.SUCCESS).json({
      message: "Login successful", token,user: { id: user.id, email: user.email, name: user.name, role: user.role, doctor_id: doctorId || null } });

  } catch (err) {
    console.error(err);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export const patientSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(255).required(),
  name: Joi.string().max(255).required(),
  phone_number: Joi.string().max(255).required(),
  address: Joi.string().max(255).allow(null, ""),
  gender: Joi.string().valid("male", "female").allow(null),
  birth_date: Joi.date().iso().allow(null)
}).unknown(false);

export const adminSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(255).required(),
  name: Joi.string().max(255).required(),
  phone_number: Joi.string().max(255).required(),
  address: Joi.string().max(255).allow(null, ""),
  gender: Joi.string().valid("male", "female"),
  birth_date: Joi.date().iso().allow(null)
}).unknown(false);

export const doctorSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(255).required(),
  name: Joi.string().max(255).required(),
  phone_number: Joi.string().max(255).required(),
  address: Joi.string().max(255).allow(null, ""),
  gender: Joi.string().valid("male", "female").allow(null),
  birth_date: Joi.date().iso().allow(null),
  specialty_id: Joi.number().required(),
  consultation_fees: Joi.number().required(),
  profile_pic_path: Joi.string().allow(null,"").optional(),
  waiting_time: Joi.number().required(),
  about_doctor: Joi.string().max(255).allow("", null),
  education_and_experience: Joi.string().max(255).allow("", null)
}).unknown(false);

export const createPatient = async (req, res) => {
  const { error } = patientSchema.validate(req.body);
  if (error) {
    return res.status(code.BAD_REQUEST).json({ error: error.message });
  }

  try {
    const { email, password, name, phone_number, address, gender, birth_date } = req.body;

    const [existing] = await db.query(query.SELECT_USER_BY_EMAIL, [email]);
    if (existing.length > 0) {
      return res.status(code.CONFLICT).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(query.CREATE_USER, [
      email, hashedPassword, name, phone_number, address,
      gender, birth_date, "patient"
    ]);

    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "Patient created successfully",
      user_id: result.insertId
    });

  } catch (err) {
    console.error(err);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export const createAdmin = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(code.FORBIDDEN).json({ error: "Admin access required" });
  }

  const { error } = adminSchema.validate(req.body);
  if (error) {
    return res.status(code.BAD_REQUEST).json({ error: error.message });
  }

  try {
    const { email, password, name, phone_number, address, gender, birth_date } = req.body;

    const [existing] = await db.query(query.SELECT_USER_BY_EMAIL, [email]);
    if (existing.length > 0) {
      return res.status(code.CONFLICT).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(query.CREATE_USER, [
      email, hashedPassword, name, phone_number, address,
      gender, birth_date, "admin"
    ]);

    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "Admin created successfully",
      user_id: result.insertId
    });

  } catch (err) {
    console.error(err);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export const createDoctor = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(code.FORBIDDEN).json({ error: "Admin access required" });
  }

  const { error } = doctorSchema.validate(req.body);
  if (error) {
    return res.status(code.BAD_REQUEST).json({ error: error.message });
  }

  let conn;
  try {
    const {
      email, password, name, phone_number, address,
      gender, birth_date, specialty_id, consultation_fees,
      waiting_time, about_doctor, education_and_experience
    } = req.body;

    const [existing] = await db.query(query.SELECT_USER_BY_EMAIL, [email]);
    if (existing.length > 0) {
      return res.status(code.CONFLICT).json({ error: "Email already in use" });
    }
    const [specialty] = await db.query( query.GET_SPECIALTY_BY_ID, [specialty_id]);

    if (specialty.length === 0) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid specialty_id: specialty does not exist"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [userResult] = await conn.query(query.CREATE_USER, [
      email, hashedPassword, name, phone_number, address,
      gender, birth_date, "doctor"
    ]);

    const newUserId = userResult.insertId;

    await conn.query(`
      INSERT INTO Doctor (
        user_id, specialty_id, profile_pic_path,
        consultation_fees, waiting_time,
        about_doctor, education_and_experience, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active');
    `, [
      newUserId,
      specialty_id,
      profile_pic_path || null,
      consultation_fees,
      waiting_time,
      about_doctor,
      education_and_experience
    ]);

    await conn.commit();
    conn.release();

    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "Doctor created successfully",
      user_id: newUserId
    });

  } catch (err) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    console.error(err);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

