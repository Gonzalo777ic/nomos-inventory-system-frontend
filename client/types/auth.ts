export type User = {
    id: string;
    email: string;
    name?: string;
    role?: "admin" | "seller";
    supplierId?: number;
};