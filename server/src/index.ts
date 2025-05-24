import express, { Request, Response } from 'express';
import path from 'path';
import { initializeDatabase, getDatabase } from './config/database';
import { logger } from './utils/logger';

const app = express();
const PORT = 3000;

// Store active SSE connections
const sseClients: Response[] = [];

// Middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'server', 'public')));

// Helper function to notify all SSE clients
function notifyClients(data: any) {
  sseClients.forEach((client, index) => {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      // Remove dead connections
      sseClients.splice(index, 1);
    }
  });
}

// API Routes
app.post('/', async (req: Request, res: Response) => {
  try {
    const { highlights } = req.body;
    const headers = req.headers;

    if (!highlights) {
      res.status(404).send('Not found');
      return;
    }

    // Simple logging to see what Moon Reader sends
    console.log('🌙 Moon Reader sent:', JSON.stringify(req.body, null, 2));

    const db = await getDatabase();

    for (const destaque of highlights) {
      const { author, title, chapter, note, text } = destaque;

      await db.run(`
        INSERT INTO highlights (
          author, title, chapter, text, note, highlightedAt,
          device_info, auth_token, content_length
        ) 
        VALUES (
          :author, :title, :chapter, :text, :note, :highlightedAt,
          :device_info, :auth_token, :content_length
        )`, {
          ':author': author,
          ':title': title,
          ':chapter': chapter || '',
          ':text': text,
          ':note': note || '',
          ':highlightedAt': new Date().toISOString(),
          ':device_info': headers['user-agent'],
          ':auth_token': headers['authorization'],
          ':content_length': headers['content-length'] ? parseInt(headers['content-length']) : null
      });
    }

    // Notify all connected clients about new highlights
    notifyClients({ type: 'new_highlights', highlights });

    res.status(201).send();
  } catch (error) {
    logger.error('Erro ao criar destaque', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.get('/destaques', async (_req, res) => {
  try {
    const db = await getDatabase();
    const destaques = await db.all('SELECT * FROM highlights');
    res.json(destaques);
  } catch (error) {
    logger.error('Erro ao listar destaques', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.get('/api/destaques', async (_req, res) => {
  try {
    const db = await getDatabase();
    const destaques = await db.all('SELECT * FROM highlights');
    res.json(destaques);
  } catch (error) {
    logger.error('Erro ao buscar destaques', error);
    res.status(500).json({ erro: 'Erro ao buscar destaques' });
  }
});

// Server-Sent Events endpoint for real-time updates
app.get('/api/events', (req: Request, res: Response) => {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection event
  res.write('data: {"type": "connected"}\n\n');

  // Add this client to the list
  sseClients.push(res);

  // Handle client disconnect
  req.on('close', () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

async function iniciarAplicacao() {
  try {
    // Inicializar o banco de dados
    await initializeDatabase();
    logger.info('Banco de dados inicializado com sucesso');

    // Iniciar o servidor
    app.listen(PORT, () => {
      logger.info(`🌙 Servidor Moon+ Reader Highlights iniciado em http://localhost:${PORT}`);
    });
    
  } catch (erro) {
    logger.error('Erro ao iniciar a aplicação', erro);
    console.error('Erro detalhado:', erro);
    process.exit(1);
  }
}

// Iniciar a aplicação
iniciarAplicacao(); 