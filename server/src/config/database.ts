import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Caminho para o arquivo do banco de dados
const DATABASE_PATH = './database.db';

// Função para obter conexão com o banco de dados
export async function getDatabase() {
  return open({
    filename: DATABASE_PATH,
    driver: sqlite3.Database
  });
}

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  const db = await getDatabase();
  
  await db.exec(`CREATE TABLE
    IF NOT EXISTS highlights (
        id              INTEGER PRIMARY KEY,
        author          TEXT,
        title           TEXT,
        chapter         TEXT,
        text            TEXT,
        note            TEXT,
        highlightedAt   TEXT,
        device_info     TEXT,
        auth_token      TEXT,
        content_length  INTEGER
    )
  `);
  
  return db;
} 