import usersRouter from './routes/users.route.js';
import medicalTestsRouter from './routes/medical-tests.route.js';
import appointmentsRouter from './routes/appointments.route.js';
import reviewsRouter from './routes/reviews.route.js';
import doctorsRouter from './routes/doctors.route.js';
import diagnosisRouter from './routes/diagnosis.route.js';
import specialtiesRouter from './routes/specialties.route.js';

const routes = [
  {
    path: '/users',
    router: usersRouter,
  },
  {
    path: '/medical-tests',
    router: medicalTestsRouter,
  },
  {
    path: '/appointments',
    router: appointmentsRouter,
  },
  {
    path: '/reviews',
    router: reviewsRouter,
  },
  {
    path: '/doctors',
    router: doctorsRouter,
  },
  {
    path: '/diagnosis',
    router: diagnosisRouter,
  },
  {
    path: '/specialties',
    router: specialtiesRouter

  },
];

export default routes;