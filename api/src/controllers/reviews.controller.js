import { db } from '../../config/database.js';
//import { query } from '../query/user.query.js';
import { code } from '../http.code.js';

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

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctor_id, rating, comment } = req.body;

    if (!doctor_id || rating === undefined) {
      return res.status(code.BAD_REQUEST).json({ error: "doctor_id and rating are required" });
    }

    if (rating < 0 || rating > 5) {
      return res.status(code.BAD_REQUEST).json({ error: "Rating must be between 0 and 5" });
    }
    const sqlQuery = `INSERT INTO DoctorReview (doctor_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)`;
    console.log("CREATE_REVIEW:", sqlQuery);
    const [result] = await db.query(sqlQuery, [
      doctor_id,
      userId,
      rating,
      comment || null
    ]);

    return res.status(201).json({
      message: "Review created successfully",
      review: {
        id: result.insertId,
        doctor_id,
        user_id: userId,
        rating,
        comment
      }
    });

  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(code.SERVER_ERROR).json({ error: "Internal server error" });
  }
};
