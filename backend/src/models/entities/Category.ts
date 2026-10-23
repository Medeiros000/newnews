export class Category {
	private id: number
	private name: string
	private label: string
	private icon: string
	constructor(id: number, name: string, label: string, icon: string) {
		this.id = id
		this.name = name
		this.label = label
		this.icon = icon
	}
	public getId(): number {
		return this.id
	}
	public getName(): string {
		return this.name
	}
	public getLabel(): string {
		return this.label
	}
	public getIcon(): string {
		return this.icon
	}
}