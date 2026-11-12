export interface CreateNewsDto {
  id: string,
  category_id: string,
  title: string,
  description: string,
  url: string,
  author: string,
  image_url: string,
  language: string,
  source: string,
  published_at: Date,
}
