export class News {
    private id: string;
    private category_id: string;
    private badge_bg: string;
    private title: string;
    private summary: string;
    private content: string;
    private image_url: string;
    private published_at: Date;
    private author: string;
    private source: string;
    constructor(
        id: string,
        category_id: string,
        badge_bg: string,
        title: string,
        summary: string,
        content: string,
        image_url: string,
        published_at: Date,
        author: string,
        source: string
    ) {
        this.id = id;
        this.category_id = category_id;
        this.badge_bg = badge_bg;
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.image_url = image_url;
        this.published_at = published_at;
        this.author = author;
        this.source = source;
    }
}