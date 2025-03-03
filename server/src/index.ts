import { criarServidor, opcoesEscuta } from './config/servidor';
import { initializeDatabase } from './config/database';
import { logger } from './utils/logger';
import express from 'express';

// Configuração do servidor web
const servidorWeb = express();
const PORTA_WEB = 3001;

// Servir arquivos estáticos
servidorWeb.use(express.static('server/public'));

// API para destaques
servidorWeb.get('/api/destaques', async (_req, res) => {
  try {
    const db = await initializeDatabase();
    const destaques = await db.all('SELECT * FROM highlights');
    res.json(destaques);
  } catch (erro) {
    logger.error('Erro ao buscar destaques', erro);
    res.status(500).json({ erro: 'Erro ao buscar destaques' });
  }
});

async function iniciarAplicacao() {
  try {
    // Inicializar o banco de dados
    await initializeDatabase();
    logger.info('Banco de dados inicializado com sucesso');

    // Iniciar o servidor API
    const servidor = criarServidor();
    await servidor.listen(opcoesEscuta);
    logger.info(`🌙 Servidor API Moon+ Reader Highlights iniciado em http://localhost:${opcoesEscuta.port}`);
    
    // Iniciar o servidor web
    servidorWeb.listen(PORTA_WEB, () => {
      logger.info(`🌐 Servidor web iniciado em http://localhost:${PORTA_WEB}`);
    });
  } catch (erro) {
    logger.error('Erro ao iniciar a aplicação', erro);
    process.exit(1);
  }
}

// Iniciar a aplicação
iniciarAplicacao(); 