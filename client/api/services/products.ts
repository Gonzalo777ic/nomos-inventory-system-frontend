import type { Product } from "../../types";
import { tryRequest } from "../http";

const LS_KEY = "nomos_products";

function seed(): Product[] {
  //const exist = localStorage.getItem(LS_KEY);
  //if (exist) return JSON.parse(exist);
  const data: Product[] = [
    { id: "p1", title: "1", author: "1", isbn: "9780156013987", price: 39.9, stock: 8, category: "Infantil" },
    { id: "p2", title: "2", author: "2", isbn: "9780307474728", price: 59.9, stock: 3, category: "Novela" },
    { id: "p3", title: "3", author: "3", isbn: "9780062316110", price: 72.5, stock: 15, category: "Ensayo" },
  ];
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  return data;
}

function read(): Product[] {
  return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
}

function write(data: Product[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export async function listProducts(): Promise<Product[]> {
  return tryRequest(
    async () => {
      // Example real endpoint
      throw new Error("no-backend");
    },
    async () => seed(),
  );
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return tryRequest(
    async () => {
      throw new Error("no-backend");
    },
    async () => read().find((p) => p.id === id),
  );
}

export async function createProduct(input: Omit<Product, "id">): Promise<Product> {
  return tryRequest(
    async () => {
      throw new Error("no-backend");
    },
    async () => {
      const data = read();
      const item: Product = { id: crypto.randomUUID(), ...input };
      data.push(item);
      write(data);
      return item;
    },
  );
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product> {
  return tryRequest(
    async () => {
      throw new Error("no-backend");
    },
    async () => {
      const data = read();
      const idx = data.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Producto no encontrado");
      data[idx] = { ...data[idx], ...input };
      write(data);
      return data[idx];
    },
  );
}

export async function deleteProduct(id: string): Promise<void> {
  return tryRequest(
    async () => {
      throw new Error("no-backend");
    },
    async () => {
      const data = read().filter((p) => p.id !== id);
      write(data);
    },
  );
}
