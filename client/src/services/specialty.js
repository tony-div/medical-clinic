import api from "./api";

export const getSpecialties = async () => {
    return api.get("/specialties");
};

export const createSpecialty = async (data) => {
    return api.post("/specialties", data);
};

export const getSpecialtyById = async (specialtyId) => {
    return api.get(`/specialties/${specialtyId}`);
};
