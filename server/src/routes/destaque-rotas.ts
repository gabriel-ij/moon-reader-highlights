import { FastifyInstance } from 'fastify';
import { criarDestaque, listarDestaques } from '../controllers/destaque-controller';

export default function destaqueRotas(fastify: FastifyInstance, _opts: any, done: () => void) {
  // Rota para criar destaques (POST /)
  fastify.post('/', criarDestaque);
  
  // Rota para listar todos os destaques (GET /destaques)
  fastify.get('/destaques', listarDestaques);
  
  done();
} 