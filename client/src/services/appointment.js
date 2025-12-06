import api from "./api";

export const getAppointments = () => {
    return api.get("/appointments");
};

export const createAppointment = (data) => {
    return api.post("/appointments", data);
};

export const updateAppointment = (appointmentId, data) => {
    return api.patch(`/appointments/${appointmentId}`, data);
};

export const getAppointmentsByUserId = (userId) => {
    return api.get(`/appointments/user/${userId}`);
};

export const getAppointmentById = (appointmentId) => {
    return api.get(`/appointments/${appointmentId}`);
};
