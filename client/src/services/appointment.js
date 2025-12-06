import api from "./api";

export const getAppointments = async () => {
    return api.get("/appointments/list/");
};

export const createAppointment = async (data) => {
    return api.post("/appointments", data);
};

export const updateAppointment = async (appointmentId, data) => {
    return api.patch(`/appointments/details/${appointmentId}`, data);
};

export const getAppointmentsByUserId = async (userId) => {
    return api.get(`/appointments/shared/${userId}`);
};

export const getAppointmentById = async (appointmentId) => {
    return api.get(`/appointments/details/${appointmentId}`);
};

// const appointmentsRouter = express.Router();
// appointmentsRouter.use(authenticate);
// appointmentsRouter.get('/list', getAppointments);

// appointmentsRouter.post('/',createAppointment);

// appointmentsRouter.patch('/details/:appointmentId', updateAppointment);

// appointmentsRouter.get('/shared/:userId', getAppointmentsByUserId);

// appointmentsRouter.get('/details/:appointment_id', getAppointmentById);