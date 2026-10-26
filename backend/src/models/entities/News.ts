import { slugify } from '../../utils/slugify.js';

export class News {
    private id: string;
    private category_id: number;
    private badge_bg: string;
    private title: string;
    private slug: string;
    private content: string;
    private image_url: string;
    private news_url: string;
    private published_at: Date;
    private author: string;
    private source: string;
    public constructor(
        id: string,
        category_id: number,
        badge_bg: string,
        title: string,
        slug: string,
        content: string,
        image_url: string,
        news_url: string,
        published_at: Date,
        author: string,
        source: string
    ) {
        this.id = id;
        this.category_id = category_id;
        this.badge_bg = badge_bg;
        this.title = title;
        this.slug = slugify(title);
        this.content = content;
        this.image_url = image_url;
        this.news_url = news_url;
        this.published_at = published_at;
        this.author = author;
        this.source = source;
    }
    public getId(): string {
        return this.id;
    }
    public getCategoryId(): number {
        return this.category_id;
    }
    public getBadgeBg(): string {
        return this.badge_bg;
    }
    public getTitle(): string {
        return this.title;
    }
    public getSlug(): string {
        return this.slug;
    }
    public getContent(): string {
        return this.content;
    }
    public getImageUrl(): string {
        return this.image_url;
    }
    public getNewsUrl(): string {
        return this.news_url;
    }
    public getPublishedAt(): Date {
        return this.published_at;
    }
    public getAuthor(): string {
        return this.author;
    }
    public getSource(): string {
        return this.source;
    }
}