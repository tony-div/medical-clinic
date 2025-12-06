import api from "./api.js";

export const login = async (email, password) => {
    return api.post("/users/login", { email, password });
};

export const registerPatient = async (data) => {
    return api.post("/users/",data);
};
