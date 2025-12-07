import api from "./api";

export const getUser = async (userId) => {
    return api.get(`/users/${userId}`);
};

export const updateUser = async (userId, data) => {
    return api.patch(`/users/${userId}`, data);
}

export const deleteUser = async (userId) => {
    return api.delete(`/users/${userId}`);
};

export const createPatient = async (data) => {
    return api.post("/users/",data);
};

export const createAdmin = async (data) => {
    return api.post("/users/admin",data);
};

export const createDoctor = async (data) => {
    return api.post("/users/doctor",data);
};