import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/database.js";
import { query } from "../query/user.query.js";
import { code } from "../http.code.js";

export const getUserById = async (req, res) => {
  const id = req.params.userId;
    try{
      const [user] = await db.query(query.SELECT_USER_BY_ID, [id])
      if(user.length === 0){
        return res.status(code.NOT_FOUND).json({error: "User not found"});
      }
      return res.status(code.SUCCESS).json({
        message: "success",
        user: user[0]
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
  role: Joi.string().valid("patient", "doctor", "admin").default("patient")
}).unknown(false).min(1);



export const updateUser = async (req, res) => {
  const userId = req.params.userId;

  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    console.log(error.message);
    return res.status(code.BAD_REQUEST).json({
      error: "An invalid entry was entered, please check the inputs"
    });
  }

  const { email, password, name, phone_number, address, gender, birth_date, role } = req.body;
  let updatedUser = { email, password, name, phone_number, address, gender, birth_date, role };

  try {
    const [rows] = await db.query(query.SELECT_USER_BY_ID, [userId]);
    if (rows.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "User not found" });
    }

    const targetUser = rows[0];
    const requester = req.user;

    if (requester.role !== "admin") {
      if (requester.id !== Number(userId)) {
        return res.status(code.FORBIDDEN).json({
          error: "You are not authorized to update another user's account"
        });
      }
      delete updatedUser.role;
    }

    Object.keys(updatedUser).forEach(key => {
      if (updatedUser[key] === undefined) delete updatedUser[key];
    });

    if (updatedUser.password) {
      updatedUser.password = await bcrypt.hash(updatedUser.password, 10);
    }


    await db.query(query.UPDATE_USER_BY_ID, [updatedUser, userId]);

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

  try {
    const [rows] = await db.query(query.SELECT_USER_BY_ID, [userId]);
    if (rows.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "User not found" });
    }

    if (requester.role !== "admin" && requester.id !== Number(userId)) {
      return res.status(code.FORBIDDEN).json({
        error: "You are not authorized to delete this user",
      });
    }

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


export const createUserSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(255).required(),
  name: Joi.string().max(255).required(),
  phone_number: Joi.string().max(255).required(),
  address: Joi.string().max(255).allow(null, ""),
  gender: Joi.string().valid("male", "female").allow(null),
  birth_date: Joi.date().iso().allow(null),
  role: Joi.string().valid("patient", "doctor", "admin").default("patient")
}).unknown(false);

export const createUser = async (req, res) => {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    console.log(error.message);
    return res
      .status(code.BAD_REQUEST)
      .json({ error: "An invalid entry was entered, please check the inputs" });
  }
    try {
    const { email, password, name, phone_number, address, gender, birth_date, role } = req.body;
    const [existing] = await db.query(query.SELECT_USER_BY_EMAIL, [email]);
    if (existing.length > 0) {
      return res.status(code.CONFLICT).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query( query.CREATE_USER,
      [email, hashedPassword, name, phone_number, address, gender, birth_date, role]
    );

    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "User created successfully",
      user: { id: result.insertId, email, name, phone_number, address, gender, birth_date, role}
    });

  } catch (error) {
    console.error(error);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
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
    if (!passwordMatch) {
      return res.status(code.FORBIDDEN).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(code.SUCCESS).json({
      message: "Login successful", token,user: { id: user.id, email: user.email, name: user.name, role: user.role } });

  } catch (err) {
    console.error(err);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};
