import app from "./src/index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// import express from 'express';

// const app = express();
// const PORT = process.env.SERVER_PORT;

// app.get('/greet', (req, res) => {
//   res.send('hello world');
// });

// app.listen(PORT,"0.0.0.0", () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });