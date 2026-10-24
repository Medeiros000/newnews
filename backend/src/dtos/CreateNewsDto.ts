export interface CreateNewsDto {
    category_id: number;
    badge_bg: string;
    title: string;
    summary: string;
    content: string;
    image_url: string;
    published_at: Date;
    author: string;
    source: string;
}
