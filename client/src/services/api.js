import axios from "axios";
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

console.log("API URL:", import.meta.env.VITE_API_URL);
const api = axios.create({
    baseURL: 'http://localhost:5000'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
