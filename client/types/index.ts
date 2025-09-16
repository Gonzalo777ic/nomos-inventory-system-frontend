export type Product = {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  category?: string;
  price: number;
  stock: number;
};

export type Supplier = {
  id: string;
  name: string;
  contactEmail?: string;
  phone?: string;
};

export type Sale = {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  date: string;
};

export type Alert = {
  id: string;
  productId: string;
  threshold: number;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "seller";
};
