import axios from "axios";

// Use environment variable if it exists, otherwise default to localhost:5000
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log("Using API URL:", baseURL);

const api = axios.create({
    baseURL: baseURL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;