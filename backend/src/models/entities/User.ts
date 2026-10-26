export class User {
    private id: string
    private name: string
    private email: string
    private avatar: string
    constructor(id: string, email: string, name: string, avatar: string) {
        this.id = id
        this.name = name
        this.email = email
        this.avatar = avatar
    }
    public getId(): string {
        return this.id
    }
    public getLabel(): string {
        return this.name
    }
    public getIcon(): string {
        return this.email
    }
    public getAvatar(): string {
        return this.avatar
    }
}