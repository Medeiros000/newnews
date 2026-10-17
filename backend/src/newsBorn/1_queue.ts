
export class NewsQueue {
  private queue: any[] = [];

  // Enfileira apenas o limite definido (ex: N + 1 itens)
  enqueue(articles: any[], maxLimit: number = 11) {
    const limitedArticles = articles.slice(0, maxLimit);
    this.queue.push(...limitedArticles);
  }

  dequeue(): any | undefined {
    return this.queue.shift();
  }

  get length(): number {
    return this.queue.length;
  }
}