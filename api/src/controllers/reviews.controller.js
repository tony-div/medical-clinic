import { db } from '../../config/database.js';
//import { query } from '../query/user.query.js';
import { code } from '../http.code.js';
import Joi from 'joi';

export const getReviewsByDoctorId = async (req, res) => {
  const doctorId = req.params.doctorId;
  const sqlQuery = `
  SELECT User.name AS user ,rating, comment, date
  FROM DoctorReview
  JOIN User ON user_id = User.id
  WHERE doctor_id = ?`

  try{
    const [rows, fields] = await db.query(sqlQuery, [doctorId]);

    const censoredReviews = rows.map(review => {
      const name = review.user;
      if(name){
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts[1];
        review.user = `${firstName} ${lastName.charAt(0)}.`
      }
      return review
    })

    res.status(200).json({
      message: 'ok',
      data: censoredReviews
    })

  } catch(error){
    console.error('error',error);
    res.status(500).json({
      message: 'Internal server error',
      'error':error.message
    })

  }
};

const reviewSchema = Joi.object({
  doctor_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(0).max(5).required(),
  comment: Joi.string().allow(null, "").max(500)
});

export const createReview = async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== "patient") {
      return res.status(code.FORBIDDEN).json({
        error: "Only patients can create reviews"
      });
    }
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(code.BAD_REQUEST).json({
        error: "Invalid review data: " + error.message
      });
    }

    const { doctor_id, rating, comment } = req.body;
    const [doctorRows] = await db.query(
      "SELECT id FROM Doctor WHERE id = ?",
      [doctor_id]
    );

    if (doctorRows.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "Doctor not found" });
    }

    const [existingReview] = await db.query(
      "SELECT id FROM DoctorReview WHERE doctor_id = ? AND user_id = ?",
      [doctor_id, requester.id]
    );

    if (existingReview.length > 0) {
      return res.status(code.BAD_REQUEST).json({
        error: "You have already reviewed this doctor"
      });
    }

    const sqlQuery = `
      INSERT INTO DoctorReview (doctor_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sqlQuery, [
      doctor_id,
      requester.id,
      rating,
      comment || null
    ]);
    
    return res.status(code.CREATED_SUCCESSFULLY).json({
      message: "Review created successfully",
      review: {
        id: result.insertId,
        doctor_id,
        user_id: requester.id,
        rating,
        comment
      }
    });

  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};