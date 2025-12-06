import api from "./api";

export const getTimeSlots = (doctorId) => {
    return api.get(`/time-slots/${doctorId}`);
};
