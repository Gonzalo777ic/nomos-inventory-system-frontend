import axios, { AxiosRequestHeaders } from "axios";

// ⚠️ Usaremos el puerto completo en el baseURL para mayor claridad.
// Ahora apuntando al puerto 8082, según la ruta de Postman confirmada.
export const http = axios.create({
  baseURL: 'http://localhost:8082/api', // Corregido: usando el puerto 8082
});

// ❌ Eliminamos el interceptor de token aquí. 
// La lógica de Token (Auth0/Zustand) ahora solo reside en AuthAxiosProvider.tsx.

export async function tryRequest<T>(fn: () => Promise<{ data: T }>, fallback: () => Promise<T>): Promise<T> {
  try {
    const res = await fn();
    return res.data;
  } catch {
    return await fallback();
  }
}
