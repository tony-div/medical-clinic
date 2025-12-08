import api from "./api.js";

export const getDoctors = () => {
    return api.get('/doctors');
};

export const getDoctorByUserId = async (userId) => {
    return api.get(`/doctors/profile-user-id/${userId}`);
};

export const getDoctorByDocId = async (doctorId) => {
    return api.get(`/doctors/profile-doctor-id/${doctorId}`);
};

export const getDoctorsBySpecialty = async (specialtyId) => {
    return api.get(`/doctors/specialty/${specialtyId}`);
};

export const getDoctorScheduleByDocId = async (doctorId) => {
    return api.get(`/doctors/schedule/${doctorId}`);
};

export const createSchedule = async (data) => {
    return api.post('/doctors/schedule', data);
};

export const updateSchedule = async (scheduleId, data) => {
    return api.patch(`/doctors/schedule/${scheduleId}`, data);
};

export const deleteSchedule = async (scheduleId) => {
    return api.delete(`/doctors/schedule/${scheduleId}`);
};
