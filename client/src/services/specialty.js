import api from "./api";

export const getSpecialties = () => {
    return api.get("/specialties");
};

export const createSpecialty = (data) => {
    return api.post("/specialties", data);
};

export const getSpecialtyById = (specialtyId) => {
    return api.get(`/specialties/${specialtyId}`);
};
