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
