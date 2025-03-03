import * as fs from 'fs';
import { Destaque } from '../models/destaque';
import { getDatabase } from '../config/database';

export async function salvarDestaques(destaques: Destaque[], headers: any): Promise<void> {
  const db = await getDatabase();

  for (const destaque of destaques) {
    const { author, title, chapter, note, text } = destaque;

    await db.run(`
      INSERT INTO highlights (
        author, title, chapter, text, note, highlightedAt,
        device_info, auth_token, content_length, request_timestamp
      ) 
      VALUES (
        :author, :title, :chapter, :text, :note, :highlightedAt,
        :device_info, :auth_token, :content_length, :request_timestamp
      )`, {
        ':author': author,
        ':title': title,
        ':chapter': chapter || '',
        ':text': text,
        ':note': note || '',
        ':highlightedAt': new Date().toISOString(),
        ':device_info': headers['user-agent'],
        ':auth_token': headers['authorization'],
        ':content_length': parseInt(headers['content-length']),
        ':request_timestamp': new Date().toISOString()
    });

    // Registra o destaque em um arquivo de log
    registrarDestaque(destaque);
  }
}

export async function obterTodosDestaques(): Promise<Destaque[]> {
  const db = await getDatabase();
  return db.all('SELECT * FROM highlights');
}

function registrarDestaque(destaque: Destaque): void {
  const { author, title, chapter, text, note } = destaque;
  const logEntry = `[${new Date().toISOString()}] Author: ${author}, Title: ${title}, Chapter: ${chapter}, Text: ${text}, Note: ${note}\n`;
  fs.appendFileSync('server/logs/highlights.log', logEntry);
} 