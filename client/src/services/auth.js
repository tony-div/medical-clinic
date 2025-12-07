// import api from "./api.js";

// export const login = async (email, password) => {
//     return api.post("/users/login", { email, password });
// };

// export const registerPatient = async (data) => {
//     return api.post("/users/",data);
// };

// export const getMe = async (req, res) => {
//     try {
//         const user = req.user;
//         if (!user) return res.status(401).json({ error: "Not logged in" });
//         res.json({ user });
//     } catch (e) {
//         res.status(500).json({ error: "Server error" });
//     }
// };

import api from "./api.js";

export const login = async (email, password) => {
    return api.post("/users/login", { email, password });
};

export const registerPatient = async (data) => {
    return api.post("/users/", data);
};

// FIX: This is now a proper client-side API call
export const getMe = async () => {
    // Note: This requires your backend to have a route for /users/profile or similar
    // If you don't use this function in your dashboard, it won't affect the current bug.
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if(user && user.id) {
        return api.get(`/users/${user.id}`);
    }
    return Promise.reject("No user ID found");
};