import express from 'express';
import path from 'path';
import { getDatabase } from './config/database';
import { logger } from './utils/logger';

const app = express();
const PORTA_WEB = 3001;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(process.cwd(), 'server', 'public')));

// Rota para obter todos os destaques
app.get('/api/destaques', async (_req, res) => {
  try {
    const db = await getDatabase();
    const destaques = await db.all('SELECT * FROM highlights');
    res.json(destaques);
  } catch (erro) {
    logger.error('Erro ao buscar destaques', erro);
    res.status(500).json({ erro: 'Erro ao buscar destaques' });
  }
});

// Iniciar o servidor web
export function iniciarServidorWeb() {
  app.listen(PORTA_WEB, () => {
    logger.info(`Servidor web iniciado em http://localhost:${PORTA_WEB}`);
  });
}