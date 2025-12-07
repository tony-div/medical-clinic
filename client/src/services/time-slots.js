import api from "./api";

// export const getTimeSlots = async (doctorId) => {
//     return api.get(`/time-slots/${doctorId}`);
// };
// service
export const getTimeSlots = async (doctorId, startDate) => {
    const params = {};

    if (startDate) params.startDate = startDate;

    return api.get(`/time-slots/${doctorId}`, { params });
};
