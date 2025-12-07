import api from "./api";

export const createMedicalTest = async (data) => {
    return api.post("/medical-tests", data);
};

export const getMedicalTestById = async (testId) => {
    return api.get(`/medical-tests/${testId}`);
};

export const uploadMedicalTestFile = async (testId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/medical-tests/${testId}/file`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};
//medicalTestsRouter.get('/appointment/:appointmentId', authenticate, getMedicalTestByAppointmentId);

export const getMedicalTestByAppointmentId = async (appointmentId) => {
    return api.get(`/medical-tests/appointment/${appointmentId}`);
};