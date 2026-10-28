import type { Server } from 'http';
import { App } from './app.js';
import { env } from './config/env.js';
import { Logger } from './utils/Logger.js';
import { NewsSchedulerHandler } from './services/newsIngestion/handlers/NewsSchedulerHandler.js';

const logger = new Logger('Server');
const app = new App();

// Inicia o agendador de ingestão de notícias de forma desacoplada da classe App
const newsScheduler = new NewsSchedulerHandler();

const server: Server = app.listen(env.PORT, () => {
  logger.info(`Servidor API escutando em http://localhost:${env.PORT}`);
});

const shutdown = (signal: 'SIGINT' | 'SIGTERM'): void => {
  logger.info(`Sinal recebido: ${signal}. Encerrando aplicação...`);
  newsScheduler.stop();
  server.close(async (error?: Error) => {
    if (error) {
      logger.error('Erro ao fechar o servidor HTTP:', error);
      process.exit(1);
    }
    logger.info('Servidor HTTP encerrado.');
    process.exit(0);
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
