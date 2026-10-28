import type { ICommand } from '../../../commands/ICommand.js';
import { IngestNewsCommand } from '../../../commands/IngestNewsCommand.js';
import { Logger } from '../../../utils/Logger.js';
import { AbstractNewsHandler } from './INewsHandler.js';

export interface SchedulerOptions {
    intervalMs?: number;
    runImmediately?: boolean;
}

export class NewsSchedulerHandler extends AbstractNewsHandler<void, void> {
    private readonly logger = new Logger('NewsSchedulerHandler');
    private readonly command: ICommand;
    private readonly intervalMs: number;
    private timer?: ReturnType<typeof setInterval>;
    private isRunning = false;

    public constructor(
        command: ICommand = new IngestNewsCommand(),
        options: SchedulerOptions = {},
    ) {
        super();
        this.command = command;
        this.intervalMs = options.intervalMs ?? 60 * 60 * 1000; // Padrão: 1 hora

        if (options.runImmediately ?? true) {
            this.start();
        }
    }

    public start(): void {
        if (this.isRunning) {
            this.logger.warn('O agendador de ingestão de notícias já está em execução.');
            return;
        }

        const run = async () => {
            try {
                this.logger.info('Disparando execução agendada de ingestão de notícias...');
                await this.command.execute();
            } catch (error) {
                this.logger.error('Erro durante a execução do comando agendado de ingestão:', error);
            }
        };

        this.isRunning = true;
        run(); // Executa imediatamente no início
        this.timer = setInterval(run, this.intervalMs);

        this.logger.info(
            `Agendador de ingestão iniciado com intervalo de ${this.intervalMs / 60_000} minutos.`,
        );
    }

    public stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.isRunning = false;
        this.logger.info('Agendador de ingestão de notícias finalizado.');
    }

    public async handle(): Promise<void | null> {
        this.start();
        return this.passToNext(undefined as unknown as void);
    }
}

