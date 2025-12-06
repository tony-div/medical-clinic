import api from "./api";

export const getReviewsByDoctorId = async (doctorId) => {
    return api.get(`/reviews/${doctorId}`);
};

export const createReview = async (data) => {
    return api.post("/reviews", data);
};

//reviewsRouter.get('/rating/:ratingId', getRatingById);
export const getRating = async (ratingId) => {
    return api.get(`/reviews/rating/${ratingId}`);
};