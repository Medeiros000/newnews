export class News {
	constructor(
		public readonly id: string,
		public readonly category_id: string,
		public readonly title: string,
		public readonly description: string,
		public readonly url: string,
		public readonly author: string,
		public readonly image_url: string,
		public readonly language: string,
		public readonly source: string,
		public readonly published_at: Date,
	) {}
}
