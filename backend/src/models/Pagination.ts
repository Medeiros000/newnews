export class Pagination<T> {
    private page: number;
    private limit: number;
    private totalItems: number;
    private totalPages: number;
    
    constructor(page: number, limit: number, totalItems: number) {
        this.page = page;
        this.limit = limit;
        this.totalItems = totalItems;
        this.totalPages = Math.ceil(totalItems / limit);
    }
    public getPage(): number {
        return this.page;
    }
    public setPage(page: number): void {
        this.page = page;
    }
    public getLimit(): number {
        return this.limit;
    }
    public setLimit(limit: number): void {
        this.limit = limit;
    }
    public getTotalItems(): number {
        return this.totalItems;
    }
    public setTotalItems(totalItems: number): void {
        this.totalItems = totalItems;
        this.totalPages = Math.ceil(totalItems / this.limit);
    }
    public getTotalPages(): number {
        return this.totalPages;
    }
    public toJSON(): object {
        return {
            page: this.page,
            limit: this.limit,
            totalItems: this.totalItems,
            totalPages: this.totalPages,
        };
    }
}