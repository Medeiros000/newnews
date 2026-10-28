import { PrismaService } from '../services/PrismaService.js';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
    private readonly context: string;
    private static prismaInstance?: PrismaService;

    public constructor(context: string) {
        this.context = context;
    }

    private static getPrisma(): PrismaService | null {
        try {
            if (!Logger.prismaInstance) {
                Logger.prismaInstance = PrismaService.getInstance();
            }
            return Logger.prismaInstance;
        } catch {
            return null;
        }
    }

    private format(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] [${this.context}]: ${message}`;
    }

    private async persistLog(level: LogLevel, message: string, metadata?: any): Promise<void> {
        try {
            const prisma = Logger.getPrisma();
            if (!prisma) return;

            let stringifiedMeta: string | null = null;
            if (metadata !== undefined) {
                if (metadata instanceof Error) {
                    stringifiedMeta = JSON.stringify({
                        name: metadata.name,
                        message: metadata.message,
                        stack: metadata.stack,
                    });
                } else if (typeof metadata === 'object') {
                    stringifiedMeta = JSON.stringify(metadata);
                } else {
                    stringifiedMeta = String(metadata);
                }
            }

            // Grava na tabela logs de forma assíncrona desacoplada
            await (prisma as any).log.create({
                data: {
                    level,
                    context: this.context,
                    message,
                    metadata: stringifiedMeta,
                },
            });
        } catch {
            // Falha não-bloqueante na persistência do log para não interromper a aplicação
        }
    }

    public info(message: string, ...optionalParams: any[]): void {
        console.log(this.format('info', message), ...optionalParams);
        const meta = optionalParams.length > 0 ? optionalParams : undefined;
        this.persistLog('info', message, meta);
    }

    public warn(message: string, ...optionalParams: any[]): void {
        console.warn(this.format('warn', message), ...optionalParams);
        const meta = optionalParams.length > 0 ? optionalParams : undefined;
        this.persistLog('warn', message, meta);
    }

    public error(message: string, error?: any): void {
        console.error(this.format('error', message));
        if (error) {
            console.error(error);
        }
        this.persistLog('error', message, error);
    }

    public debug(message: string, ...optionalParams: any[]): void {
        console.debug(this.format('debug', message), ...optionalParams);
        const meta = optionalParams.length > 0 ? optionalParams : undefined;
        this.persistLog('debug', message, meta);
    }
}
