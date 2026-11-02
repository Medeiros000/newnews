export class News {
  constructor(
    public readonly id: string,
    public readonly category_id: number,
    public readonly badge_bg: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly content: string,
    public readonly image_url: string,
    public readonly news_url: string,
    public readonly published_at: Date,
    public readonly author: string,
    public readonly source: string
  ) {}
}