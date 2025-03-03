import { FastifyRequest, FastifyReply } from 'fastify';
import { DestaqueRequest } from '../models/destaque';
import { salvarDestaques, obterTodosDestaques } from '../services/destaque-servico';

export async function criarDestaque(request: FastifyRequest, reply: FastifyReply) {
  const { body } = request as unknown as { body: DestaqueRequest };
  const { highlights } = body;
  const { headers } = request;

  if (!highlights) {
    return reply.callNotFound();
  }

  await salvarDestaques(highlights, headers);
  return reply.code(201);
}

export async function listarDestaques(_request: FastifyRequest, reply: FastifyReply) {
  const destaques = await obterTodosDestaques();
  return reply.send(destaques);
} 