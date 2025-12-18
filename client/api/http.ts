import axios, { AxiosRequestHeaders } from "axios";



export const http = axios.create({
  baseURL: 'http://localhost:8082/api',
});




export async function tryRequest<T>(fn: () => Promise<{ data: T }>, fallback: () => Promise<T>): Promise<T> {
  try {
    const res = await fn();
    return res.data;
  } catch {
    return await fallback();
  }
}
