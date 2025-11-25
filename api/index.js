import express from 'express';
import { db } from "./config/database.js"

const app = express();
const PORT = process.env.SERVER_PORT;

app.get('/greet', (req, res) => {
  res.send('hello world');
});

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

//db tests and sanity checks, feel free to delete --

app.get('/apple', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS db_status');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
});

app.get('/banana', async (req, res) => {
  try {
    const [rows] = await db.query('SHOW DATABASES');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
});