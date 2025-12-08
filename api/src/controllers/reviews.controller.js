import { db } from '../../config/database.js';
import { query } from '../query/user.query.js';
import { code } from '../http.code.js';
import Joi from 'joi';

export const getReviewsByDoctorId = async (req, res) => {
  const doctorId = req.params.doctorId;
  const sqlQuery = `
    SELECT 
      COALESCE(User.name, 'Deleted User') AS user,
      rating,
      comment,
      date
    FROM DoctorReview
    LEFT JOIN User ON DoctorReview.user_id = User.id
    WHERE doctor_id = ?;`

  try{
    const [rows, fields] = await db.query(sqlQuery, [doctorId]);

    const censoredReviews = rows
    // .map(review => {
    //   const name = review.user;
    //   if(name){
    //     const nameParts = name.trim().split(/\s+/);
    //     const firstName = nameParts[0];
    //     const lastName = nameParts[1];
    //     review.user = `${firstName} ${lastName.charAt(0)}.`
    //   }
    //   return review
    // })

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
  comment: Joi.string().allow(null, "").max(255)
});

export const createReview = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection(); 
    await conn.beginTransaction();

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
    
    const [doctorRows] = await conn.query(
      "SELECT id, rating_id FROM Doctor WHERE id = ?",
      [doctor_id]
    );
    if (doctorRows.length === 0) {
      return res.status(code.NOT_FOUND).json({ error: "Doctor not found" });
    }

    const [existingReview] = await conn.query(
      "SELECT id FROM DoctorReview WHERE doctor_id = ? AND user_id = ?",
      [doctor_id, requester.id]
    );
    if (existingReview.length > 0) {
      return res.status(code.BAD_REQUEST).json({
        error: "You have already reviewed this doctor"
      });
    }

    const ratingId = doctorRows[0].rating_id;

    if (ratingId === null) {
      const [newRating] = await conn.query(
        "INSERT INTO DoctorRating (avg_rating, reviews_count) VALUES (?, ?)",
        [rating, 1]
      );

      await conn.query(
        "UPDATE Doctor SET rating_id = ? WHERE id = ?",
        [newRating.insertId, doctor_id]
      );

    } else {
   
      const [oldRating] = await conn.query(
        "SELECT avg_rating, reviews_count FROM DoctorRating WHERE id = ?",
        [ratingId]
      );

      const oldAvg = parseFloat(oldRating[0].avg_rating);
      const oldCount = oldRating[0].reviews_count;

      const newCount = oldCount + 1;
      const newAvg = ((oldAvg * oldCount) + rating) / newCount;

      await conn.query(
        "UPDATE DoctorRating SET avg_rating = ?, reviews_count = ? WHERE id = ?",
        [newAvg.toFixed(1), newCount, ratingId]
      );
    }

    const [result] = await conn.query(
      `INSERT INTO DoctorReview (doctor_id, user_id, rating, comment)
        VALUES (?, ?, ?, ?)`,
      [doctor_id, requester.id, rating, comment || null]
    );

    await conn.commit();

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
    if (conn) await conn.rollback();
    console.error("Error creating review:", err);

    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  } finally {
    if (conn) conn.release();
  }
};

export const getRatingById = async (req, res) => {
  try{
    const ratingId = req.params.ratingId;
    const [rating] = await db.query(query.GET_RATING_BY_ID, [ratingId]);
    if(rating.length === 0){
      return res.status(code.BAD_REQUEST).json({error:"id not found"});
    }
    return res.status(code.SUCCESS).json({message:"retrieved successfully", rating: rating[0]});
  }catch(error){
    console.error("Error creating review:", error);
    return res.status(code.SERVER_ERROR).json({
      error: "Internal server error"
    });
  }
};