import api from "./api";

export const createMedicalTest = (data) => {
    return api.post("/medical-tests", data);
};

export const getMedicalTestById = (testId) => {
    return api.get(`/medical-tests/${testId}`);
};

export const uploadMedicalTestFile = (testId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/medical-tests/${testId}/file`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};
