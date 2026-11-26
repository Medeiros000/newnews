export class Tag {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly slug: string,
		public readonly createdAt?: Date,
		public readonly newsCount?: number,
	) {}
}
