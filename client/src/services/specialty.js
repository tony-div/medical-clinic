import api from "./api";

export const getSpecialties = async () => {
    return api.get("/specialties");
};

export const createSpecialty = async (name) => {
    return api.post("/specialties", {name});
};

export const getSpecialtyById = async (specialtyId) => {
    return api.get(`/specialties/${specialtyId}`);
};

export const deleteSpecialtyById = async (specialtyId) => {
    return api.delete(`/specialties/${specialtyId}`);
}