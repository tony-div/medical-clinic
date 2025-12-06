import api from "./api.js";

export const login = async (email, password) => {
    return api.post("/users/login", { email, password });
};

export const registerPatient = async (data) => {
    return api.post("/users/",data);
};

export const getMe = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Not logged in" });
        res.json({ user });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
};
