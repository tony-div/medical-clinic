import api from "./api";

export const getReviewsByDoctorId = (doctorId) => {
    return api.get(`/reviews/${doctorId}`);
};

export const createReview = (data) => {
    return api.post("/reviews", data);
};
