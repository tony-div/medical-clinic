import express from 'express';
import routes from './app.routes.js';

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/greet', (req, res) => {
  res.send('hello world');
});

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});