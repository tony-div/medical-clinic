import api from "./api.js";

export const getDoctors = () => {
    return api.get('/doctors');
};

export const getDoctorById = (doctorId) => {
    return api.get(`/doctors/profile/${doctorId}`);
};

export const getDoctorsBySpecialty = (specialtyId) => {
    return api.get(`/doctors/specialty/${specialtyId}`);
};

export const getDoctorScheduleByDocId = (doctorId) => {
    return api.get(`/doctors/schedule/${doctorId}`);
};

export const createSchedule = (data) => {
    return api.post('/doctors/schedule', data);
};

export const updateSchedule = (scheduleId, data) => {
    return api.patch(`/doctors/schedule/${scheduleId}`, data);
};

export const deleteSchedule = (scheduleId) => {
    return api.delete(`/doctors/schedule/${scheduleId}`);
};
