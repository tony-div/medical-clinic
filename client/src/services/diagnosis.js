import api from "./api.js";

export const getDiagnosisByAppointmentId = async (appointmentId) => {
    return api.get(`/diagnosis/${appointmentId}`);
};

export const createDiagnosis = async (appointmentId, data) => {
    return api.post(`/diagnosis/${appointmentId}`, data);
};
