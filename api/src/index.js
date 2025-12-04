import express from 'express';
import routes from './app.routes.js';
import { db } from "../config/database.js";

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('api/uploads'));

app.get('/greet', (req, res) => {
  res.send('hello world');
});

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

if (process.env.NODE_ENV !== "test") {
    db.getConnection()
      .then(() => console.log("Database connected ✔️"))
      .catch(err => console.error("DB connection error:", err));
}

export default app;

// import express from 'express';
// import routes from './app.routes.js';


// import { db } from '../config/database.js';


// const app = express();
// const PORT = 5000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static('api/uploads'));

// app.get('/greet', (req, res) => {
//   res.send('hello world');
// });

// routes.forEach(({ path, router }) => {
//   app.use(path, router);
// });

// db.query('SELECT 1')
//   .then(() => console.log('Database connected ✔️'))
//   .catch(err => console.error('Database error ❌:', err));



// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });

// export default app;
