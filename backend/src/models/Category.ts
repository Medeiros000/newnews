export class Category {
    id: string
    label: string
    icon: string
    constructor(id: string, icon: string, label: string) {
        this.id = id
        this.label = label
        this.icon = icon
    }
}