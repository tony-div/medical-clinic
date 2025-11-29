import { db } from '../../config/database.js';
import { query } from '../query/user.query.js';
import { code } from '../http.code.js';
import Joi from 'joi';

const createMedicalTestSchema = Joi.object({
  appointment_id: Joi.number().required(),
  test_date: Joi.date().optional().allow(null),
  description: Joi.string().max(255).allow(null, "")
}).unknown(false);

export const createMedicalTest = async (req, res) => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeader}`);

  const { error } = createMedicalTestSchema.validate(req.body);
  if (error) {
    console.log(error.message)
    return res.status(code.BAD_REQUEST).json({ error: "An invalid entry was entered, please check the inputs" });
  }

  let { appointment_id, test_date, description } = req.body;
  let mTest = { appointment_id, file_path: "N/A", test_date, description };
  try {

    const [appointment] = await db.query( query.SELECT_APPOINTMENT_BY_ID, [appointment_id]);
    if (appointment.length === 0) {
      return res.status(code.NOT_FOUND).json({error: "Medical Test does not exist",});
    }

    const result = await db.query(query.CREATE_MEDICAL_TEST, Object.values(mTest));
    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "Medical test created successfully",
      medical_test: { id: result.insertId, ...mTest }
    });
  }catch(error){
    console.error(error);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

const updateMedicalTestSchema = Joi.object({
  appointment_id: Joi.number().optional(),
  test_date: Joi.date().optional().allow(null),
  description: Joi.string().max(255).allow(null, "")
}).min(1).unknown(false);
  
export const updateMedicalTest = async  (req, res) => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeader}`);

  const { error } = updateMedicalTestSchema.validate(req.body)
  if(error){
    console.log(error.message);
    return res.status(code.BAD_REQUEST).json({error: "An invalid entry was entered, please check the inputs"  });
  }

  let { test_date, description } = req.body;
  const id = req.params.id;
  let mTest = { test_date, description };
  Object.keys(mTest).forEach(key => {
    if (mTest[key] === undefined) delete mTest[key];
  });
  try{

    const [ medicalTest ] = await db.query(query.SELECT_MEDICAL_TEST_BY_ID, [id]);
    if(medicalTest.length === 0){
      return res.status(code.NOT_FOUND).json({error: "Medical Test not found"});
    }

    const result = await db.query(query.UPDATE_MEDICAL_TEST, [mTest, id]);
    return res.status(code.SUCCESS).json({ message: "updated successfully" });
  } catch(error){
    console.error(error);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};
  
export const uploadMedicalTestFile = async (req, res) => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl}`);

  const id = req.params.id;

  try{
    if (!req.file) {
      return res.status(code.BAD_REQUEST).json({
        error: "No file uploaded",
      });
    }
    const filePath = `/uploads/medical-tests/${req.file.filename}`;

    const [medicalTest] = await db.query(query.SELECT_MEDICAL_TEST_BY_ID, [id]);
    if (medicalTest.length === 0) {
      return res.status(code.NOT_FOUND).json({
        error: "Medical test not found",
      });
    }

    const result = await db.query(query.UPDATE_MEDICAL_TEST, [{ file_path: filePath }, id]);
    return res.status(code.SUCCESS).json({ message: "File uploaded successfully", file_path: filePath });

  } catch(error){
    console.error(error);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error"});
  }

};
  
export const getMedicalTestById = async (req, res) => {
  const id = req.params.id;
  try{
    const [mTest] = await db.query(query.SELECT_MEDICAL_TEST_BY_ID,[id])
    if(mTest.length === 0){
      return res.status(code.NOT_FOUND).json({error: "Medical Test not found"});
    }
    return res.status(code.SUCCESS).json({
      message: "success",
      medicalTest: mTest[0]
    });
  }catch(error){
    console.error(error);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
  
};
  
export const deleteMedicalTestById = async (req, res) => {
  const id = req.params.id;
  try{
    const [mTest] = await db.query(query.SELECT_MEDICAL_TEST_BY_ID,[id])
    if(mTest.length === 0){
      return res.status(code.NOT_FOUND).json({error: "Medical Test not found"});
    }
    const result = await db.query(query.DELETE_MEDICAL_TEST, [id]);
    return res.status(code.SUCCESS).json({ message: "success"});
  }catch(error){
    console.error(error);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};
