import * as fs from 'fs';
import * as path from 'path';

// Diretório de logs
const LOG_DIR = path.join(process.cwd(), 'server', 'logs');

// Níveis de log
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// Garantir que o diretório de logs existe
function garantirDiretorioLogs(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// Função principal de logging
export function log(level: LogLevel, mensagem: string, dados?: any): void {
  garantirDiretorioLogs();
  
  const timestamp = new Date().toISOString();
  const dadosFormatados = dados ? `\n${JSON.stringify(dados, null, 2)}` : '';
  const entradaLog = `[${timestamp}] [${level}] ${mensagem}${dadosFormatados}\n`;
  
  // Arquivo de log com data atual
  const dataAtual = new Date().toISOString().split('T')[0];
  const arquivoLog = path.join(LOG_DIR, `app-${dataAtual}.log`);
  
  fs.appendFileSync(arquivoLog, entradaLog);
  
  // Também exibe no console
  console.log(`[${level}] ${mensagem}`);
}

// Funções de conveniência
export const logger = {
  info: (mensagem: string, dados?: any) => log(LogLevel.INFO, mensagem, dados),
  warn: (mensagem: string, dados?: any) => log(LogLevel.WARN, mensagem, dados),
  error: (mensagem: string, dados?: any) => log(LogLevel.ERROR, mensagem, dados),
  debug: (mensagem: string, dados?: any) => log(LogLevel.DEBUG, mensagem, dados)
}; 