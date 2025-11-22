import express from 'express';

const app = express();
const PORT = 5000;

app.get('/greet', (req, res) => {
  res.send('hello world');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});