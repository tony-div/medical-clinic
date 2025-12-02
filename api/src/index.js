import express from 'express';
import cors from 'cors';
import routes from './app.routes.js';


import { db } from '../config/database.js';


const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://157.230.17.44:5173', 'http://157.230.17.44:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('api/uploads'));

app.get('/greet', (req, res) => {
  res.send('hello world');
});

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

db.query('SELECT 1')
  .then(() => console.log('Database connected ✔️'))
  .catch(err => console.error('Database error ❌:', err));



app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});