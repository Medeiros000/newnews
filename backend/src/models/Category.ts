export class Category {
	private id: string
	private label: string
	private icon: string
	constructor(id: string, icon: string, label: string) {
		this.id = id
		this.label = label
		this.icon = icon
	}
	public getId(): string {
		return this.id
	}
	public getLabel(): string {
		return this.label
	}
	public getIcon(): string {
		return this.icon
	}
}