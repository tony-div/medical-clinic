import api from "./api";

export const getTimeSlots = async (doctorId) => {
    return api.get(`/time-slots/${doctorId}`);
};
