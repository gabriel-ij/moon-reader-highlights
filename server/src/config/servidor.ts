import fastify, { FastifyInstance } from 'fastify';
import destaqueRotas from '../routes/destaque-rotas';

// Configurações do servidor
const PORTA = 3000;
const ESCUTAR_TODAS_INTERFACES = false;

export function criarServidor(): FastifyInstance {
  const servidor = fastify({ logger: true });
  
  // Registrar rotas
  servidor.register(destaqueRotas);
  
  return servidor;
}

export const opcoesEscuta = {
  port: PORTA,
  host: ESCUTAR_TODAS_INTERFACES ? '0.0.0.0' : undefined,
}; 