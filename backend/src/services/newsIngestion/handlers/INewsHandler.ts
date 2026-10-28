import { CurrentsArticle } from '../CurrentsApiClient.js';
import { NormalizedNews } from '../NewsNormalizer.js';

export interface INewsHandler<TIn = NormalizedNews, TOut = NormalizedNews> {
  setNext<TNextOut>(handler: INewsHandler<TOut, TNextOut>): INewsHandler<TOut, TNextOut>;
  handle(input: TIn): Promise<TOut | null>;
}

export abstract class AbstractNewsHandler<
  TIn = NormalizedNews,
  TOut = NormalizedNews,
> implements INewsHandler<TIn, TOut> {
  private next?: INewsHandler<TOut, any>;

  public setNext<TNextOut>(handler: INewsHandler<TOut, TNextOut>): INewsHandler<TOut, TNextOut> {
    this.next = handler;
    return handler;
  }

  protected async passToNext(output: TOut): Promise<any | null> {
    if (this.next) {
      return this.next.handle(output);
    }
    return output;
  }

  public abstract handle(input: TIn): Promise<TOut | null>;
}
