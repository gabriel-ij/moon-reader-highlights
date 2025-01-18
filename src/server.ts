import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app = express();
const port = 3001;

app.use(express.static('public'));

app.get('/api/highlights', async (_req, res) => {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  const highlights = await db.all('SELECT * FROM highlights');
  res.json(highlights);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});