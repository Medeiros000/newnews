import type { NormalizedNews } from '../NewsNormalizer.js';

export interface INewsHandler {
    setNext(handler: INewsHandler): INewsHandler;
    handle(news: NormalizedNews): Promise<NormalizedNews | null>;
}

export abstract class AbstractNewsHandler implements INewsHandler {
    private next?: INewsHandler;

    public setNext(handler: INewsHandler): INewsHandler {
        this.next = handler;
        return handler;
    }

    protected async passToNext(news: NormalizedNews): Promise<NormalizedNews | null> {
        if (this.next) {
            return this.next.handle(news);
        }
        return news;
    }

    public abstract handle(news: NormalizedNews): Promise<NormalizedNews | null>;
}

