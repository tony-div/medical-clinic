import db from '../../database.js';

export const getReviewsByDoctorId = async (req, res) => {
  const doctorId = req.params.doctorId;
  const query = `
  SELECT User.name AS user ,rating, comment, date
  FROM DoctorReview
  JOIN User ON user_id = User.id
  WHERE doctor_id = ?`

  try{
    const [rows, fields] = await db.query(query, [doctorId]);

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

export const createReview = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};
